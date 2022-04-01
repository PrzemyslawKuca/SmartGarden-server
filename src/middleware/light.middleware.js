import rpio from 'rpio';

export const light = (status) => {
    rpio.open(15, rpio.OUTPUT, rpio.LOW);
    if(status){
        rpio.write(15, rpio.LOW );
    }
    else{
        rpio.write(15, rpio.HIGH);
    }
    
}