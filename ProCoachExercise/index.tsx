import React, { FC, useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { Route, TabView, SceneRendererProps } from "react-native-tab-view";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Appbar, Layout, Toast } from "components";
import { useRoute, useNavigation, useDispatch } from "utils/hooks";
import { RootStackParamList } from "utils/types/navigation";
import { getCircuits, getWorkout } from "redux/selector/workout-selector";
import { generateWorkoutResult } from "redux/action/workout-result";
import ForwardArrowIcon from "assets/svg/forward-arrow.svg";
import { ms } from "utils/theme/Scale";

import ExerciseList from "./components/ExerciseList";
import Controls, { ProCoachExerciseControlsRef } from "./components/Controls";

const ProCoachExercise: FC = () => {
  const controlsRef = useRef<ProCoachExerciseControlsRef>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { params } =
    useRoute<RouteProp<RootStackParamList, "ProCoachExercise">>();
  const { workoutId } = params;
  const workout = getWorkout(workoutId);
  const circuits = getCircuits(workoutId);
  const [index, setIndex] = useState<number>(0);
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const val: Route[] = [];
    Object.keys(circuits).forEach((key) => {
      val.push({ key, title: `${key} Series Exercises` });
    });
    setRoutes(val);
    Toast.show({
      title: "Reminder",
      subtitle: "Tap the tick to save your weight and reps",
      props: {
        showClose: true,
      },
    });
  }, []);

  const onBack =
    index > 0
      ? () => {
          setIndex((prevValue) => prevValue - 1);
        }
      : undefined;

  const rightIcon =
    index < routes.length - 1
      ? () => (
          <TouchableOpacity
            onPress={() => setIndex((prevValue) => prevValue + 1)}
          >
            <ForwardArrowIcon />
          </TouchableOpacity>
        )
      : undefined;

  const renderTabBar = () => (
    <Appbar
      text={routes?.[index]?.title}
      onBack={onBack}
      rightIcon={rightIcon}
      textStyle={styles.title}
    />
  );

  const onEndWorkout = () => {
    dispatch(generateWorkoutResult(workoutId)).then(
      ({ lastOfTemplate, lastOfPlan }) => {
        if (lastOfTemplate || lastOfPlan) {
          navigation.navigate("WorkoutResult", {
            generateNextPlan: lastOfPlan,
            planId: workout?.plan_id?.toString() ?? "",
            templateId: workout?.referenced_template_id?.toString() ?? "",
            kind: workout?.kind ?? "",
          });
        } else {
          navigation.navigate("EndProgramScreen");
        }
      }
    );
  };

  const onFinishCircuit = (routeIndex: number) => {
    const isLastCircuit = routeIndex === routes.length - 1;
    if (isLastCircuit) {
      Alert.alert("Workout Complete", "End workout?", [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            if (controlsRef.current) {
              controlsRef.current.pause();
            }
            onEndWorkout();
          },
        },
      ]);
    } else {
      Toast.show({
        type: "success",
        title: `Move to ${routes[routeIndex + 1].key} exercises`,
      });
    }
  };

  const renderScene = ({
    route,
  }: SceneRendererProps & {
    route: Route;
  }) => {
    const routeIndex = routes.findIndex((item) => item.key === route.key);

    return (
      <ExerciseList
        circuitCharacter={route.key}
        workoutId={workoutId}
        onFinishCircuit={() => onFinishCircuit(routeIndex)}
        isInitialTab={routeIndex === 0}
      />
    );
  };

  return (
    <Layout>
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        swipeEnabled={false}
        lazy
      />
      <Controls
        ref={controlsRef}
        onEndWorkout={onEndWorkout}
        workoutId={workoutId}
      />
    </Layout>
  );
};

export default ProCoachExercise;

const styles = StyleSheet.create({
  title: {
    fontSize: ms(18),
    lineHeight: ms(26),
  },
});
