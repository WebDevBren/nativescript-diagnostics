import { find, isFinite, isString } from 'lodash';

export class DiagnosticsCommon {

    protected osVersion: number;
    protected _eventStore: any = null;
    protected _locationListener: any = null;
    protected _locationManager: any = null;

    protected status: { [key: string]: any };

    protected mapStatus(key: string, obj: any): any {
        this.status[key] = {}
        let statuses = ['NotDetermined', 'Restricted', 'Denied', 'Authorized', 'Available', 'AuthorizedAlways', 'AuthorizedWhenInUse', 'Undetermined', 'Granted']
        let i, len = statuses.length
        for (i = 0; i < len; i++) {
            let index = find(obj, function(vv, ii) {
                if (isString(ii) && ii.indexOf(statuses[i]) != -1) {
                    return true
                }
            })
            if (isFinite(index)) {
                this.status[key][statuses[i]] = obj[obj[index]]
                this.status[key][obj[obj[index]]] = statuses[i]
            }
        }
    }

}