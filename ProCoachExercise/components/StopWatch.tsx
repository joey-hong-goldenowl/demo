import React, { FC, useRef, useState, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native'

import theme from 'theme'
import { formatTime } from 'utils/time'
import PauseIcon from 'assets/svg/pause.svg'
import PlayIcon from 'assets/svg/play.svg'
import ResetIcon from 'assets/svg/reset.svg'
import { ms } from 'utils/theme/Scale'
import { Text } from 'components'

type StopWatchProps = {
  style?: ViewStyle
}

const StopWatch: FC<StopWatchProps> = ({ style }) => {
  const interval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [timeInSecond, setTimeInSecond] = useState<number>(0)
  const [started, setStarted] = useState<boolean>(false)

  const start = () => {
    setStarted(true)
    interval.current = setInterval(() => {
      setTimeInSecond(prevValue => prevValue + 1)
    }, 1000)
  }

  const stop = () => {
    setStarted(false)
    if (interval.current !== null) {
      clearInterval(interval.current)
    }
  }

  const reset = () => {
    stop()
    setTimeInSecond(0)
    start()
  }

  useEffect(
    () => () => {
      if (interval.current !== null) {
        clearInterval(interval.current)
      }
    },
    [],
  )

  return (
    <View style={[styles.container, style]}>
      <Text>
        <Text style={styles.controlsText}>Stopwatch - </Text>
        <Text style={styles.controlsTextBold}>
          {formatTime(timeInSecond * 1000)}
        </Text>
      </Text>
      <View style={styles.buttonsContainer}>
        <View style={[styles.button, styles.buttonSpacing]}>
          {started ? (
            <TouchableOpacity style={styles.action} onPress={stop}>
              <PauseIcon
                width={ms(28)}
                height={ms(28)}
                fill={theme.colors.white}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.action} onPress={start}>
              <PlayIcon
                width={ms(28)}
                height={ms(28)}
                fill={theme.colors.white}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.button} onPress={reset}>
          <ResetIcon width={ms(20)} height={ms(20)} fill={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default StopWatch

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  action: {
    width: ms(42),
    height: ms(42),
    alignItems: 'center',
    justifyContent: 'center',
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
  button: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  buttonSpacing: { marginRight: ms(24) },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(10),
  },
})
