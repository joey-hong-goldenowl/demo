import React, { FC, memo, useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import { debounce } from 'lodash'

import { Text, Toggle } from 'components'
import theme from 'theme'
import { ms } from 'utils/theme/Scale'
import { useDispatch, useSelector } from 'utils/hooks'
import { WEIGHT_UNIT, WEIGHT_UNIT_TOGGLE_VALUE } from 'utils/constants'
import { validateDecimalNumber, validateNumber } from 'utils/text'
import {
  WorkoutResultGenerateType,
  actions as workoutResultAction,
} from 'redux/reducer/workout-result-reducer'
import CheckToggleFilled from 'assets/svg/check-toggle-filled.svg'
import CheckToggleOutline from 'assets/svg/check-toggle-outline.svg'
import {
  saveStrengthWorkoutProCoach,
  updateStrengthWorkoutProCoach,
} from 'redux/action/workout-result'
import { getWorkoutRecordNote } from 'redux/selector/workout-result-selector'

const FLASHING_CHECK_TIME = 7000

type InputType = 'reps' | 'weight'

type TableItemRowProps = {
  workoutDetailId: string
  set: number
  isHighlighted: boolean
  shouldFlash: boolean
  onNote: ({
    workoutDetailId,
    set,
  }: {
    workoutDetailId: string
    set: number
  }) => void
  onComplete: ({
    finishedSet,
    finishedWorkoutDetailId,
  }: {
    finishedSet: number
    finishedWorkoutDetailId: string
  }) => void
}

const TableItemRow: FC<TableItemRowProps> = ({
  set,
  isHighlighted,
  shouldFlash,
  workoutDetailId,
  onNote,
  onComplete,
}) => {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState<boolean>(false)
  const recordNote = useSelector(state =>
    getWorkoutRecordNote(state, Number(workoutDetailId), set),
  )
  const [workoutRecord, setWorkoutRecord] = useState<WorkoutResultGenerateType>(
    {
      set,
      reps: 0,
      weight: '',
      total_time: 0,
      workout_detail_id: workoutDetailId,
      note: recordNote,
      is_edited: false,
      weight_unit: WEIGHT_UNIT.KG,
      record_id: null,
    },
  )
  const [checkIconColor, setCheckIconColor] = useState<string>(
    theme.colors.success,
  )

  useEffect(() => {
    if (shouldFlash) {
      const startTime = new Date().getTime()
      const interval = setInterval(() => {
        setCheckIconColor(prevValue =>
          prevValue === theme.colors.success
            ? theme.colors.white
            : theme.colors.success,
        )
        if (new Date().getTime() - startTime > FLASHING_CHECK_TIME) {
          clearInterval(interval)
          setCheckIconColor(theme.colors.success)
        }
      }, 300)
    }
  }, [])

  useEffect(() => {
    setWorkoutRecord(prevValue => {
      if (prevValue.note === recordNote) return prevValue

      const updatedRecord = {
        ...prevValue,
        note: recordNote,
      }

      // update record should update store value as well
      if (updatedRecord.record_id) {
        updateRecord(updatedRecord)
      }

      return updatedRecord
    })
  }, [recordNote])

  const onChangeInput = ({
    recordValue,
    type,
  }: {
    recordValue: string
    type: InputType
  }) => {
    if (
      (type === 'reps' && !validateNumber(recordValue)) ||
      (type === 'weight' && !validateDecimalNumber(recordValue))
    )
      return
    const repsData = type === 'reps' ? { reps: Number(recordValue) } : {}
    const weightData = type === 'weight' ? { weight: recordValue } : {}
    const updatedWorkoutRecord = {
      ...workoutRecord,
      ...repsData,
      ...weightData,
      total_time: 0,
      is_edited: true,
    }
    setWorkoutRecord(updatedWorkoutRecord)
    if (updatedWorkoutRecord.record_id) {
      updateRecord(updatedWorkoutRecord)
    }
  }

  const onSaveRecord = async () => {
    Keyboard.dismiss()

    if (workoutRecord?.record_id) {
      onComplete({ finishedSet: set, finishedWorkoutDetailId: workoutDetailId })
      return
    }

    if (!workoutRecord.is_edited) {
      Alert.alert(
        'Save set',
        'Are you sure you want to save a set with no record?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                const editedRecord = {
                  ...workoutRecord,
                  note: workoutRecord.note ? workoutRecord.note : 'Set skipped',
                  is_edited: true,
                }
                await saveRecord(editedRecord)
                dispatch(
                  workoutResultAction.updateProCoachNote({
                    workoutDetailId: Number(workoutDetailId),
                    set,
                    note: editedRecord.note,
                  }),
                )
              } catch (e) {
                setLoading(false)
              }
            },
          },
        ],
      )
      return
    }

    try {
      await saveRecord(workoutRecord)
    } catch (e) {
      setLoading(false)
    }
  }

  const saveRecord = async (recordToSave: WorkoutResultGenerateType) => {
    setLoading(true)
    const workoutResult = await dispatch(
      saveStrengthWorkoutProCoach({ data: recordToSave }),
    ).unwrap()
    const createdRecord = workoutResult.data.find(
      record => record.attributes.set === workoutRecord.set,
    )
    setWorkoutRecord({
      ...recordToSave,
      record_id: createdRecord?.id,
      weight: createdRecord?.attributes.weight.value.toString() ?? '0',
      reps: createdRecord?.attributes.reps ?? 0,
    })
    setLoading(false)
    onComplete({
      finishedSet: set,
      finishedWorkoutDetailId: workoutDetailId,
    })
  }

  const updateRecord = useCallback(
    debounce(async (updatedWorkoutRecord: WorkoutResultGenerateType) => {
      setLoading(true)
      await dispatch(
        updateStrengthWorkoutProCoach({
          data: updatedWorkoutRecord,
        }),
      ).unwrap()
      setLoading(false)
    }, 1000),
    [],
  )

  const onChangeWeightUnit = () => {
    const updatedWorkoutRecord = {
      ...workoutRecord,
      total_time: 0,
      weight_unit:
        workoutRecord.weight_unit === WEIGHT_UNIT.KG
          ? WEIGHT_UNIT.LB
          : WEIGHT_UNIT.KG,
    }
    setWorkoutRecord(updatedWorkoutRecord)

    if (updatedWorkoutRecord.record_id) {
      updateRecord(updatedWorkoutRecord)
    }
  }

  const getSet = () => {
    if (isHighlighted) {
      return (
        <View style={styles.setContainer}>
          <Text style={styles.setText}>{workoutRecord.set}</Text>
          <View style={styles.setArrowIconContainer}>
            <Text style={styles.setArrow}>{'>'}</Text>
          </View>
        </View>
      )
    }

    return <Text style={styles.setText}>{workoutRecord.set}</Text>
  }

  const getInput = ({ type }: { type: InputType }) => (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={
          workoutRecord.is_edited
            ? type === 'reps'
              ? (workoutRecord.reps ?? 0).toString()
              : workoutRecord.weight
            : ''
        }
        onChangeText={(val: string) =>
          onChangeInput({ recordValue: val, type })
        }
        keyboardType="decimal-pad"
        placeholder="-"
        placeholderTextColor={theme.colors.black}
      />
    </View>
  )

  const onSelectNote = () => {
    onNote({ workoutDetailId, set })
  }

  const getItemAction = () => (
    <View style={[styles.actionIconContainer, { flexDirection: 'row' }]}>
      <Pressable onPress={onSelectNote} style={{ marginRight: ms(10) }}>
        <FontAwesome5 name="edit" size={ms(24)} color={theme.colors.black} />
      </Pressable>
      {loading ? (
        <ActivityIndicator
          color={theme.colors.primary}
          style={styles.loadingIndicator}
        />
      ) : (
        <Pressable onPress={onSaveRecord}>
          {workoutRecord?.record_id ? (
            <CheckToggleFilled
              width={ms(30)}
              height={ms(30)}
              fill={theme.colors.success}
            />
          ) : (
            <CheckToggleOutline
              width={ms(30)}
              height={ms(30)}
              fill={isHighlighted ? checkIconColor : theme.colors.success}
            />
          )}
        </Pressable>
      )}
    </View>
  )

  const getItemUnitToggle = () => (
    <View style={styles.actionIconContainer}>
      <Toggle
        options={WEIGHT_UNIT_TOGGLE_VALUE}
        value={workoutRecord?.weight_unit ?? WEIGHT_UNIT.KG}
        onChange={onChangeWeightUnit}
        trackBarConfig={{
          width: ms(66),
          height: ms(32),
          radius: ms(16),
        }}
        thumbButtonConfig={{
          width: ms(33),
          height: ms(32),
          radius: ms(16),
        }}
      />
    </View>
  )

  return (
    <View
      style={[
        styles.tableItemContainer,
        {
          backgroundColor: isHighlighted
            ? theme.colors.veryPaleYellow
            : theme.colors.white,
        },
      ]}>
      <View style={styles.tableItemFirstColumn}>{getSet()}</View>
      <View style={styles.tableItemSecondColumn}>
        {getInput({ type: 'reps' })}
      </View>
      <View style={styles.tableItemThirdColumn}>
        {getInput({ type: 'weight' })}
      </View>
      <View style={styles.tableItemFourthColumn}>{getItemUnitToggle()}</View>
      <View style={styles.tableItemFifthColumn}>{getItemAction()}</View>
    </View>
  )
}

export default memo(TableItemRow)

const styles = StyleSheet.create({
  tableItemContainer: {
    flexDirection: 'row',
    borderRightWidth: ms(0.5),
    borderLeftWidth: ms(0.5),
    borderBottomWidth: ms(0.5),
    borderColor: theme.colors.grey2,
  },
  tableItemFirstColumn: {
    flex: 1,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
  },
  tableItemSecondColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
  },
  tableItemThirdColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
  },
  tableItemFourthColumn: {
    flex: 2,
    borderRightWidth: ms(0.5),
    borderRightColor: theme.colors.grey2,
    justifyContent: 'center',
  },
  tableItemFifthColumn: {
    flex: 2.25,
    justifyContent: 'center',
  },
  setContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  setText: {
    fontSize: ms(14),
    textAlign: 'center',
  },
  setArrowIconContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 2,
    justifyContent: 'center',
  },
  inputContainer: {
    backgroundColor: 'transparent',
    padding: ms(10),
  },
  input: {
    padding: ms(10),
    color: theme.colors.black,
  },
  actionIconContainer: { alignItems: 'center', justifyContent: 'center' },
  setArrow: {
    fontSize: ms(18),
    lineHeight: ms(26),
    fontWeight: 'bold',
  },
  loadingIndicator: {
    width: ms(30),
    height: ms(30),
  },
})
