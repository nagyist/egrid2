import Rx from 'rx'
import {CALC_LAYOUT} from '../constants'

export const intentSubject = new Rx.Subject();

export const calcLayout = (data) => {
  intentSubject.onNext({
    type: CALC_LAYOUT,
    data,
  });
};