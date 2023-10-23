export const saveStrengthWorkoutProCoach = createAsyncThunk(
  "workout-result/saveStrengthWorkoutProCoach",
  async ({ data }: { data: WorkoutResultGenerateType }, { getState }) => {
    // Strength workout only
    const state = getState() as RootState;
    const { workoutId } = state.workout_result;

    const newRecord = {
      set: data.set,
      reps: data.reps,
      total_time: data.total_time,
      workout_detail_id: data.workout_detail_id,
      ...(data?.note ? { note: data?.note ?? "" } : {}),
      weight: {
        value: data.weight !== "" ? Number(data.weight) : 0,
        unit: data.weight_unit ?? WEIGHT_UNIT.KG,
      },
    };

    return post<{ data: WorkoutResultResponse[] }>({
      url: `api/workouts/${workoutId}/workout_results/bulk_create`,
      data: { workout_results: [newRecord] },
    });
  }
);
