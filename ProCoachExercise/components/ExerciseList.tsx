import React, { FC, memo, useCallback, useState } from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  SectionListRenderItem,
  SectionListData,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { StackNavigationProp } from '@react-navigation/stack'

import { Text, AnimatedWorkout, Toast } from 'components'
import theme from 'theme'
import { ms } from 'utils/theme/Scale'
import { useModal, useNavigation, useSelector } from 'utils/hooks'
import { RootStackParamList } from 'utils/types/navigation'
import { WORKOUT_TYPE } from 'utils/constants'
import { getWorkoutDetailByWorkoutIdAndCircuit } from 'redux/selector/workout-selector'
import { WorkoutDetailType } from 'redux/reducer/workout-detail-reducer'
import InfoIcon from 'assets/svg/info.svg'

import TableItemRow from './TableItemRow'
import NoteModal from './NoteModal'

type ProCoachExerciseListProps = {
  workoutId: string
  circuitCharacter: string
  onFinishCircuit: () => void
  isInitialTab: boolean
}

const ProCoachExerciseList: FC<ProCoachExerciseListProps> = ({
  workoutId,
  circuitCharacter,
  onFinishCircuit,
  isInitialTab,
}) => {
  const [visible, showModal, hideModal] = useModal(false)
  const [selectedRecord, setSelectedRecord] = useState<{
    workoutDetailId: string
    set: number
  } | null>(null)
  const workoutInfo = useSelector(state =>
    getWorkoutDetailByWorkoutIdAndCircuit(state, workoutId, circuitCharacter),
  )
  const [exerciseInfo, setExerciseInfo] = useState<
    {
      id: string
      set: number
      totalSet: number
      active: boolean
      circuit: string
      workoutDetailId: string
    }[]
  >(
    workoutInfo.map((info, index) => ({
      id: info.details.id,
      set: index === 0 ? 1 : 0,
      totalSet: Number(info.details.set),
      active: index === 0,
      circuit: info.details.circuit,
      workoutDetailId: info.details.id,
    })),
  )
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const onFinishExercise = useCallback(
    ({
      finishedSet,
      finishedWorkoutDetailId,
    }: {
      finishedSet: number
      finishedWorkoutDetailId: string
    }) => {
      const currentExerciseIndex = exerciseInfo.findIndex(info => info.active)
      if (currentExerciseIndex !== -1) {
        const currentExercise = exerciseInfo[currentExerciseIndex]
        if (
          currentExercise.workoutDetailId !== finishedWorkoutDetailId ||
          currentExercise.set !== finishedSet
        ) {
          return
        }
      }

      let nextExerciseIndex = currentExerciseIndex + 1
      if (
        currentExerciseIndex === -1 ||
        currentExerciseIndex === exerciseInfo.length - 1
      ) {
        nextExerciseIndex = 0
      }
      const nextExercise = exerciseInfo[nextExerciseIndex]
      if (nextExercise.set + 1 > nextExercise.totalSet) {
        onFinishCircuit()
        return
      }
      setExerciseInfo([
        ...exerciseInfo.slice(0, nextExerciseIndex).map(info => ({
          ...info,
          active: false,
        })),
        {
          ...nextExercise,
          active: true,
          set: nextExercise.set + 1,
        },
        ...exerciseInfo.slice(nextExerciseIndex + 1).map(info => ({
          ...info,
          active: false,
        })),
      ])
      Toast.show({
        type: 'success',
        title: `Move to ${nextExercise.circuit} set ${nextExercise.set + 1}`,
      })
    },
    [exerciseInfo],
  )

  const goToExerciseTip = (id: string) => {
    const exerciseIndex = exerciseInfo.findIndex(exercise => exercise.id === id)
    if (exerciseIndex !== -1) {
      navigation.navigate('ExerciseTip', {
        workoutId,
        circuitName: circuitCharacter,
        exerciseIndex,
        imagesWorkout: {},
        type: WORKOUT_TYPE.STRENGTH,
        showIcons: true,
      })
    }
  }

  const onNote = useCallback(
    ({ workoutDetailId, set }: { workoutDetailId: string; set: number }) => {
      setSelectedRecord({
        workoutDetailId,
        set,
      })
      showModal()
    },
    [],
  )

  const renderItem: SectionListRenderItem<
    number,
    { details: WorkoutDetailType; data: number[] }
  > = ({ item, section }) => {
    const exercise = exerciseInfo.find(
      info => info.id === section.details.id && info.active,
    )
    const highlightedSet = !exercise ? 0 : exercise.set
    return (
      <TableItemRow
        workoutDetailId={section.details.id}
        set={item}
        shouldFlash={isInitialTab && highlightedSet === item}
        isHighlighted={highlightedSet === item}
        onNote={onNote}
        onComplete={onFinishExercise}
      />
    )
  }

  const renderSectionHeader: (info: {
    section: SectionListData<
      number,
      { details: WorkoutDetailType; data: number[] }
    >
  }) => React.ReactElement = ({ section }) => (
    <>
      <View style={styles.itemHeaderContainer}>
        <View style={styles.itemInfoContainer}>
          <View style={styles.itemHeaderTextContainer}>
            <Text style={styles.itemHeaderTitle}>
              {`${section.details.circuit} - ${section.details.filtered_exercise_name}`}
            </Text>
            <View style={styles.itemHeaderSubtitleContainer}>
              <Text
                style={[
                  styles.itemHeaderSubtitle,
                  styles.itemHeaderSubtitleSpacing,
                ]}>
                Reps: {section.details.reps}
              </Text>
              <Text
                style={[
                  styles.itemHeaderSubtitle,
                  styles.itemHeaderSubtitleSpacing,
                ]}>
                Tempo: {section.details.tempo}
              </Text>
              <Text style={styles.itemHeaderSubtitle}>
                Rest: {section.details.rest}
              </Text>
            </View>
          </View>

          <Pressable onPress={() => goToExerciseTip(section.details.id)}>
            <InfoIcon width={ms(24)} height={ms(24)} />
          </Pressable>
        </View>
        {section.details?.sample_animation ? (
          <AnimatedWorkout
            uri={`${section.details.sample_animation}?tempo=${section.details.tempo}`}
            style={styles.itemHeaderImageContainer}
          />
        ) : (
          !!section.details?.sample_image && (
            <FastImage
              source={{ uri: section.details.sample_image }}
              style={styles.itemHeaderImageContainer}
              resizeMode={FastImage.resizeMode.contain}
            />
          )
        )}
      </View>

      <View style={styles.tableHeaderContainer}>
        <View style={styles.tableHeaderFirstColumn}>
          <Text style={styles.tableHeaderText}>Set</Text>
        </View>
        <View style={styles.tableHeaderSecondColumn}>
          <Text style={styles.tableHeaderText}>Reps</Text>
        </View>
        <View style={styles.tableHeaderThirdColumn}>
          <Text style={styles.tableHeaderText}>Weight</Text>
        </View>
        <View style={styles.tableHeaderFourthColumn}>
          <Text style={styles.tableHeaderText}>Unit</Text>
        </View>
        <View style={styles.tableHeaderFifthColumn}>
          <Text style={styles.tableHeaderText}>Action</Text>
        </View>
      </View>
    </>
  )

  const renderSeparator = data => (
    <View
      style={{
        height: data.leadingItem ? ms(24) : 0,
      }}
    />
  )

  return (
    <>
      {/* ignore ts here because KeyboardAwareSectionList typing for renderItem and renderSectionHeader is not dynamic */}
      {/* eslint-disable @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <KeyboardAwareSectionList
        sections={workoutInfo}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        SectionSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        stickySectionHeadersEnabled={false}
        // To offset the controls footer
        extraScrollHeight={-ms(120)}
      />
      <NoteModal
        isVisible={visible}
        onCloseModal={hideModal}
        workoutDetailId={selectedRecord?.workoutDetailId ?? ''}
        set={selectedRecord?.set ?? 0}
      />
    </>
  )
}

export default memo(ProCoachExerciseList)

const styles = StyleSheet.create({
  itemHeaderContainer: {
    flexDirection: 'row',
    marginBottom: ms(12),
  },
  itemInfoContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  itemHeaderTextContainer: {
    flex: 1,
    marginRight: ms(8),
  },
  itemHeaderTitle: {
    fontSize: ms(16),
    lineHeight: ms(24),
    color: theme.colors.black,
    fontWeight: 'bold',
    marginBottom: ms(4),
  },
  itemHeaderSubtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemHeaderSubtitle: {
    minWidth: ms(120),
    fontSize: ms(14),
    lineHeight: ms(22),
    color: theme.colors.black,
  },
  itemHeaderSubtitleSpacing: { marginRight: ms(8) },
  itemHeaderImageContainer: {
    width: ms(100),
    height: ms(100),
    marginLeft: ms(8),
  },
  contentContainer: {
    backgroundColor: theme.colors.white,
    padding: ms(16),
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    borderTopWidth: ms(0.5),
    borderRightWidth: ms(0.5),
    borderLeftWidth: ms(0.5),
    borderBottomWidth: ms(0.5),
    borderColor: theme.colors.grey2,
    backgroundColor: theme.colors.white,
  },
  tableHeaderFirstColumn: {
    flex: 1,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ms(8),
  },
  tableHeaderSecondColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderThirdColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderFourthColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderFifthColumn: {
    flex: 2.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: ms(14),
    fontWeight: 'bold',
    alignSelf: 'center',
  },
})
