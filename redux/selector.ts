export const getWorkoutRecordNote = createSelector(
  (state: RootState) => state.workout_result.proCoachNotes,
  (state: RootState, workoutDetailId: number) => workoutDetailId,
  (state: RootState, workoutDetailId: number, set: number) => set,
  (proCoachNotes, workoutDetailId, set): string =>
    proCoachNotes?.[workoutDetailId]?.[set] ?? ""
);

export const getWorkoutDetailByWorkoutIdAndCircuit = createSelector(
  [
    (state: RootState) => state.workout_detail,
    (state: RootState) => state.exercise,
    (state: RootState, workoutId: string) => workoutId,
    (state: RootState, workoutId: string, circuitCharacter: string) =>
      circuitCharacter,
  ],
  (
    workoutDetail,
    exercise,
    workoutId,
    circuitCharacter
  ): { details: WorkoutDetailType; data: number[] }[] => {
    const workoutDetails = sortWorkoutDetailByCircuit(
      Object.values(workoutDetail[workoutId] ?? {})
    );
    return workoutDetails
      .filter((item) => item.circuit.charAt(0) === circuitCharacter)
      .map((detail) => ({
        details: {
          ...detail,
          sample_animation: exercise[detail.exercise].sample_animation,
          sample_image: exercise[detail.exercise].sample_image,
        } as WorkoutDetailType,
        data: Array.from({ length: Number(detail.set) }, (_, i) => i + 1),
      }));
  }
);
