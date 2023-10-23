import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'

import { Text, WorkoutTimer } from 'components'
import theme from 'theme'
import { useNavigation, useIsFocused } from 'utils/hooks'
import { ms } from 'utils/theme/Scale'
import {
  calculateVolumeLevel,
  getMetronomeVolumeLevelFromAS,
  setMetronomeVolumeLevelToAS,
} from 'utils'
import { RootStackParamList } from 'utils/types/navigation'
import OptionIcon from 'assets/svg/option.svg'
import VolumeIcon from 'assets/svg/volume.svg'
import StopCircleIcon from 'assets/svg/stop-circle.svg'
import StopWatchIcon from 'assets/svg/timer.svg'
import HistoryIcon from 'assets/svg/history.svg'
import SearchIcon from 'assets/svg/search.svg'
import { getExpectedWorkoutTime } from 'redux/selector/workout-result-selector'
import OptionModal, {
  optionType,
} from 'pages/WorkoutProgramme/3_Exercising/components/OptionModal'
import WorkoutDayHistoryModal from 'pages/WorkoutProgramme/1_WorkoutDetail/components/WorkoutDayHistoryModal'
import { metronomeControls } from 'services/ExerciseMetronome'

import StopWatch from './StopWatch'

type ProCoachExerciseControlsProps = {
  onEndWorkout: () => void
  workoutId: string
}

export type ProCoachExerciseControlsRef = {
  pause: () => void
}

const CustomSearchIcon = () => <SearchIcon width={24} height={24} />

type ModalType = 'option' | 'volume' | 'history'

const ProCoachExerciseControls = forwardRef<
  ProCoachExerciseControlsRef,
  ProCoachExerciseControlsProps
>(({ onEndWorkout, workoutId }, ref) => {
  const [metronomeVolume, setMetronomeVolume] = useState<number>(0)
  const expectedWorkoutTime = getExpectedWorkoutTime()
  const [modalType, setModalType] = useState<ModalType | null>(null)
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const isFocused = useIsFocused()

  const onEnd = () => {
    pauseAudio()
    onEndWorkout()
  }

  const onSearch = () => {
    pauseAudio()
    navigation.navigate('Search')
  }

  const onHistory = () => {
    setModalType(null)
    setModalType('history')
  }

  const onToggleMetronome = async value => {
    metronomeControls.setVolume(calculateVolumeLevel(value))
    setMetronomeVolume(value)
    await setMetronomeVolumeLevelToAS(value.toString())
  }

  const options: optionType[] = [
    { Icon: CustomSearchIcon, text: 'Search Workout', onClick: onSearch },
    { Icon: HistoryIcon, text: 'Workout History', onClick: onHistory },
    { Icon: StopCircleIcon, text: 'End Workout', onClick: onEnd },
  ]

  const volumes: optionType[] = [
    {
      Icon: StopWatchIcon,
      text: 'Metronome',
      onClick: onToggleMetronome,
      type: 'slider',
      value: metronomeVolume,
    },
  ]

  const resetMetronome = async () => {
    metronomeControls.stop()
  }

  const fetchVolumeData = async () => {
    const metronomeLevelAS = await getMetronomeVolumeLevelFromAS()

    if (metronomeLevelAS == null) {
      setMetronomeVolumeLevelToAS('3')
    }

    const metronomeVolumeAS = Number(metronomeLevelAS ?? '3')
    setMetronomeVolume(metronomeVolumeAS)
    metronomeControls.play()
  }

  const resumeAudio = async () => {
    metronomeControls.resume()
  }

  const pauseAudio = async () => {
    metronomeControls.pause()
  }

  const onCloseModal = () => setModalType(null)

  const onClickOption = () => setModalType('option')

  const onClickVolume = () => setModalType('volume')

  useImperativeHandle(ref, () => ({ pause: pauseAudio }))

  useEffect(() => {
    fetchVolumeData()
    return () => {
      resetMetronome()
    }
  }, [])

  useEffect(() => {
    if (isFocused) {
      resumeAudio()
    }
  }, [isFocused])

  return (
    <>
      <View style={styles.controlsContainer}>
        <View style={styles.controlsTopContainer}>
          <Text>
            <Text style={styles.controlsText}>Time - </Text>
            <WorkoutTimer style={styles.controlsTextBold} />
          </Text>
          <Text>
            <Text style={styles.controlsText}>Estimated Time - </Text>
            <Text style={styles.controlsTextBold}>{expectedWorkoutTime}</Text>
          </Text>
        </View>
        <View style={styles.controlsBottomContainer}>
          <View style={styles.stopWatchContainer}>
            <StopWatch style={styles.controlsIconButtonSpacing} />
          </View>
          <View style={styles.controlsIconContainer}>
            <TouchableOpacity
              style={[
                styles.controlsIconButton,
                styles.controlsIconButtonSpacing,
              ]}
              onPress={onClickVolume}>
              <VolumeIcon width={ms(28)} height={ms(28)} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlsIconButton}
              onPress={onClickOption}>
              <OptionIcon width={ms(28)} height={ms(28)} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <OptionModal
        options={modalType === 'option' ? options : volumes}
        isVisible={modalType === 'option' || modalType === 'volume'}
        onClose={onCloseModal}
      />
      <WorkoutDayHistoryModal
        isVisible={modalType === 'history'}
        onClose={onCloseModal}
        workoutId={Number(workoutId)}
        onNavigateToHistory={pauseAudio}
      />
    </>
  )
})

export default memo(ProCoachExerciseControls)

const styles = StyleSheet.create({
  controlsContainer: {
    backgroundColor: theme.colors.white,
    padding: ms(16),
    borderTopWidth: ms(1),
    borderTopColor: theme.colors.grey2,
  },
  controlsTopContainer: {
    marginBottom: ms(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlsBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlsText: {
    fontSize: ms(14),
    lineHeight: ms(22),
    color: theme.colors.black,
  },
  controlsTextBold: {
    fontSize: ms(14),
    lineHeight: ms(22),
    color: theme.colors.black,
    fontWeight: 'bold',
  },
  controlsIconContainer: { flexDirection: 'row', alignItems: 'center' },
  controlsIconButton: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    borderWidth: ms(1),
    borderColor: theme.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsIconButtonSpacing: { marginRight: ms(10) },
  stopWatchContainer: {
    flex: 1,
    marginRight: ms(8),
    alignItems: 'center',
  },
})
