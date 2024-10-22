import * as React from "react";

interface Props {}

export const Countdown: React.FC<Props> = () => {
  const [currentTime, setCurrentTime] = React.useState<number>(Date.now());

  // use dayjs...
  const getTimeToNextDay = (currentTime: number): string => {
    const now = new Date(currentTime);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToNextDay = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(timeToNextDay / (1000 * 60 * 60)); // 1000ms * 60s * 60m
    const minutes = Math.floor((timeToNextDay / (1000 * 60)) % 60); // 1000ms * 60s
    const seconds = Math.floor((timeToNextDay / 1000) % 60); // 1000ms

    const formattedTime = [hours, minutes, seconds].map((value) => {
      if (value < 10) return `0${value}`;
      return value;
    });

    return formattedTime.join(":");
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((currentTime) => currentTime + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <span className="text-xs text-muted-foreground">{getTimeToNextDay(currentTime)}</span>;
};
