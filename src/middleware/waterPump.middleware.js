import rpio from 'rpio';

export const waterPump = (worktime) => {
    rpio.open(16, rpio.OUTPUT, rpio.LOW);

    rpio.write(16, rpio.LOW);
    setTimeout(()=>{
        rpio.write(16, rpio.HIGH);
    }, worktime * 22)
 
}