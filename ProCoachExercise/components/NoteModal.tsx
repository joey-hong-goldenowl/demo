import React, { FC, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import { ModalBottom, Text, MultilineTextInput, Button } from 'components'
import { ms } from 'utils/theme/Scale'
import { useDispatch, useSelector, useSafeAreaInsets } from 'utils/hooks'
import { actions as workoutResultAction } from 'redux/reducer/workout-result-reducer'
import { getWorkoutRecordNote } from 'redux/selector/workout-result-selector'

type NoteModalProps = {
  isVisible: boolean
  onCloseModal: () => void
  onSave?: () => void
  workoutDetailId: string
  set: number
}

const NoteModal: FC<NoteModalProps> = ({
  isVisible,
  onCloseModal,
  onSave,
  workoutDetailId,
  set,
}) => {
  const dispatch = useDispatch()
  const recordNote = useSelector(state =>
    getWorkoutRecordNote(state, Number(workoutDetailId), set),
  )
  const [noteValue, setNoteValue] = useState<string>(recordNote)
  const insets = useSafeAreaInsets()

  const onChangeNoteInput = (val: string) => setNoteValue(val)

  const onSaveNote = () => {
    dispatch(
      workoutResultAction.updateProCoachNote({
        workoutDetailId: Number(workoutDetailId),
        set,
        note: noteValue,
      }),
    )
    onCloseModal()
    onSave?.()
  }

  useEffect(() => {
    setNoteValue(recordNote)
  }, [recordNote])

  return (
    <ModalBottom
      modalVisible={isVisible}
      onCloseModal={onCloseModal}
      showActionButton={false}
      modalContainerStyle={[
        styles.noteModalContainerStyle,
        { paddingBottom: insets.bottom + ms(16) },
      ]}>
      <>
        <Text style={styles.label}>Note</Text>
        <MultilineTextInput
          value={noteValue}
          onChangeText={onChangeNoteInput}
        />
        <Button text="Save" style={styles.actionButton} onPress={onSaveNote} />
      </>
    </ModalBottom>
  )
}

export default NoteModal

const styles = StyleSheet.create({
  noteModalContainerStyle: { padding: ms(16) },
  label: {
    fontSize: ms(16),
    lineHeight: ms(24),
    fontWeight: 'bold',
    marginBottom: ms(16),
  },
  actionButton: { marginTop: ms(24) },
})
