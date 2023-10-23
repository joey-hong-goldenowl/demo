export type WorkoutResultReducerType = {
  startTime?: number;
  endTime?: number;
  workoutId?: string;
  workoutResultGenerate: WorkoutResultGenerateType[];
  loading: boolean;
  workoutResult: {
    [id: string]: WorkoutResultResponse;
  };
  exerciseCompare: ExerciseCompareType[];
  expectedWorkoutTime?: string;
  proCoachNotes: {
    [workoutDetailId: string]: {
      [set: string]: string;
    };
  };
};

const initialState: WorkoutResultReducerType = {
  workoutResultGenerate: [],
  loading: false,
  workoutResult: {},
  exerciseCompare: [],
  proCoachNotes: {},
};

const workoutResultSlice = createSlice({
  name: "workout_result",
  initialState,
  reducers: {
    addWorkoutResult(state, action: PayloadAction<WorkoutResultResponse[]>) {
      state.loading = false;
      action.payload.forEach((record) => {
        state.workoutResult[record.id] = {
          ...(state.workoutResult[record.id] ?? {}),
          ...record,
          attributes: {
            ...(state.workoutResult[record.id]?.attributes ?? {}),
            ...record.attributes,
          },
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      saveStrengthWorkoutProCoach.fulfilled,
      (state, { payload, type }) => {
        workoutResultSlice.caseReducers.addWorkoutResult(state, {
          payload: payload.data,
          type,
        });
      }
    );
    builder.addCase(saveStrengthWorkoutProCoach.rejected, (_, action) => {
      const message = action.error.message ?? "";
      showErrorMessage({ message });
    });
    builder.addCase(
      updateStrengthWorkoutProCoach.fulfilled,
      (state, { payload, type }) => {
        workoutResultSlice.caseReducers.addWorkoutResult(state, {
          payload: [payload.data],
          type,
        });
      }
    );
    builder.addCase(updateStrengthWorkoutProCoach.rejected, (_, action) => {
      const message = action.error.message ?? "";
      showErrorMessage({ message });
    });
  },
});

export const { actions } = workoutResultSlice;

export default workoutResultSlice.reducer;
