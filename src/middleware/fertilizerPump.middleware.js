import rpio from 'rpio';

export const fertilizerPump = (worktime) => {
    rpio.open(18, rpio.OUTPUT, rpio.LOW);

    rpio.write(18, rpio.LOW);
    setInterval(()=>{
        rpio.write(18, rpio.HIGH);
    }, worktime)
}