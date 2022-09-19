type Interval = null | {
    start: string;
    end: string | null;
}

type Time = {
    hours: number;
    minutes: number;
}

function getPrettyTimeWorked(totalWorkedMinutes: number, lastBeginningTime: Interval): string {
    var now = new Date();
    const minutesWorkedSinceLastBeginningTime: number = (now.getHours() * 60 + now.getMinutes()) - timeToMinutes(lastBeginningTime.start);
    const timeWorked: Time = timeConvert(totalWorkedMinutes + minutesWorkedSinceLastBeginningTime);
    return `Time worked: ${timeWorked.hours} hour(s) and ${timeWorked.minutes} minute(s).`;
}

function timeConvert(n): Time {
    let num = n;
    let hours = (num / 60);
    let rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    return {
        hours: rhours,
        minutes: rminutes,
    } as Time;
}

function getEstimatedFinishTime(lastBeginningTime: Interval, totalWorkedMinutes: number) {
    const minutesToWork: number = 8 * 60;
    const minutesToWorkLeft = minutesToWork - totalWorkedMinutes;
    const lastBeginningTimeInMinutes: number = timeToMinutes(lastBeginningTime.start);
    const estimatedFinishTimeInMinutes: number = lastBeginningTimeInMinutes + minutesToWorkLeft;
    const estimatedFinishTime: Time = timeConvert(estimatedFinishTimeInMinutes);

    let hh: string;
    if (estimatedFinishTime.hours >= 24) {
        const nextDayTime = estimatedFinishTime.hours - 24;
        hh = nextDayTime >= 10 ? `${nextDayTime}` : `0${nextDayTime}`;
    } else if (estimatedFinishTime.hours >= 10) {
        hh = `${estimatedFinishTime.hours}`;
    } else {
        hh = `0${estimatedFinishTime.hours}`;
    }
    const mm: string = estimatedFinishTime.minutes >= 10 ? `${estimatedFinishTime.minutes}` : `0${estimatedFinishTime.minutes}`;

    return `${hh}:${mm}`;
}

function timeToMinutes(time: string): number {
    const digitsRegex: RegExp = /\d+/g;

    const timeDigits: RegExpMatchArray = time.match(digitsRegex);
    const timeHours: number = Number(timeDigits[0]);
    const timeMinutes: number = Number(timeDigits[1]);
    const timeInMinutes: number = timeHours * 60 + timeMinutes;

    return timeInMinutes;
}

/*
- 11:23 - 14:44
- 15:01 - 15:49
- 15:55 - 19:33
- 19:55 -

=>

3h 21min + 48min + 3h 38min = 7h 47min worked
13min left = 20:08 estimated finish
 */
function timeTextToFinishTimeAndStats(timeText: string): void {
    const inputElement: any = document.getElementById('timesInput');
    const resultElement: any = document.getElementById('result');
    const rawInput: string = inputElement.value;
    const lines: string[] = getLines(rawInput);
    const workedMinuteIntervals: Interval[] = getWorkedMinuteIntervals(lines);
    const totalWorkedMinutes: number = getTotalWorkedMinutes(workedMinuteIntervals);
    const lastBeginningTime: Interval = getLastBeginningTime(workedMinuteIntervals);
    const prettyTimeWorked: string = getPrettyTimeWorked(totalWorkedMinutes, lastBeginningTime);
    const estimatedFinishTime: string = getEstimatedFinishTime(lastBeginningTime, totalWorkedMinutes);

    resultElement.innerHTML = `${prettyTimeWorked}<br>Estimated Finish Time: <b>${estimatedFinishTime}</b>`;
}

function getLines(times: string) {
    return times.split('\n');
}

function getWorkedMinuteIntervals(lines: string[]): Interval[] {
    const intervalRegex = /\d+:\d+/g;
    return lines.map((value) => {
        const intervalPair: RegExpMatchArray = value.match(intervalRegex);
        if (intervalPair == null) {
            return null;
        }

        switch (intervalPair.length) {
            case 2:
                return {
                    start: intervalPair[0],
                    end: intervalPair[1],
                } as Interval;
            case 1:
                return {
                    start: intervalPair[0],
                    end: null,
                } as Interval;
            default:
                return null;
        }
    });
}

function getTotalWorkedMinutes(workedMinuteIntervals: Interval[]) {
    let totalWorkedMinutes: number = 0;
    const digitsRegex: RegExp = /\d+/g;
    workedMinuteIntervals.forEach(value => {
        if (value == null || value.end == null) {
            return;
        }

        const startDigits: RegExpMatchArray = value.start.match(digitsRegex);
        const startHours: number = Number(startDigits[0]);
        const startMinutes: number = Number(startDigits[1]);
        const startInMinutes: number = startHours * 60 + startMinutes;

        const endDigits: RegExpMatchArray = value.end.match(digitsRegex);
        const endHours: number = Number(endDigits[0]);
        const endMinutes: number = Number(endDigits[1]);
        const endInMinutes: number = endHours * 60 + endMinutes;

        totalWorkedMinutes += endInMinutes - startInMinutes;
    })
    return totalWorkedMinutes;
}

function getLastBeginningTime(workedMinuteIntervals: Interval[]) {
    return workedMinuteIntervals.filter((value) => (value != null && value.end == null))[0];
}
