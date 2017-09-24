import { DiagnosticsCommon } from './diagnostics.common';
import { openUrl } from 'tns-core-modules/utils/utils'; 
import * as platform from 'tns-core-modules/platform';

class LocationListener extends NSObject implements CLLocationManagerDelegate {
    
        public static ObjCProtocols = [CLLocationManagerDelegate]
        private _resolves: any // something weird is going on here that i cant initialize this with an empty array []
        private _didSetup: boolean
    
        private locationManagerDidChangeAuthorizationStatus(manager: any, status: number): void {
            if (!this._didSetup) { // returns status immedietely after new LocationListener()
                this._didSetup = true
                return
            }
            let i, len = this._resolves.length
            for (i = 0; i < len; i++) {
                this._resolves[i](status)
            }
        }
    
        public setupPromise(resolve: () => void): void {
            if (this._resolves == undefined) {
                this._resolves = []
            }
            this._resolves.push(resolve)
        }
    
    }

export class DiagnosticsIOS extends DiagnosticsCommon {

    constructor() {
        super();

        this.mapStatus('BackgroundRefresh', UIBackgroundRefreshStatus)        
        this.mapStatus('Camera', AVAuthorizationStatus);
        this.mapStatus('Contacts', ABAuthorizationStatus);
        this.mapStatus('Pictures', PHAuthorizationStatus);
        this.mapStatus('Location', CLAuthorizationStatus);
        this.mapStatus('Microphone', AVAudioSessionRecordPermission);
        this.mapStatus('Calendar', EKAuthorizationStatus);
    }
    
    /**
     * APP SETTINGS
     * 
     * @memberof DiagnosticsIOS
      */

    public switchToAppSettings() {
        openUrl(UIApplicationOpenSettingsURLString);
    }
    
    /**
     * Checks if the IOS Location services are Enabled
     * 
     * @returns {boolean} 
     * @memberof DiagnosticsIOS
     */
    public isLocationEnabled() : boolean {
        return CLLocationManager.locationServicesEnabled();
    }

    /**
     * Checks if the User has Authorized the App to use Location.
     * 
     * @returns {number} 
     * @memberof DiagnosticsIOS
     */
    public getLocationAuthorizationStatus(): number {
        return CLLocationManager.authorizationStatus();
    }

    public isLocationAuthorized(): boolean {
        let status: number = this.getLocationAuthorizationStatus()
        return (
            status == this.status['Location']['AuthorizedAlways']
            ||
            status == this.status['Location']['AuthorizedWhenInUse']
        )
    }

    public isLocationAvailable(): boolean {
        return this.isLocationEnabled() && this.isLocationAuthorized()
    }

    public requestLocationAuthorization(type: string = 'WhenInUse'): Promise<any> {
        let status: number = this.getLocationAuthorizationStatus()
        if (status != this.status['Location']['NotDetermined']) {
            return Promise.resolve(status)
        }

        if (this._locationListener == null) {
            this._locationListener = new LocationListener()
        }
        if (this._locationManager == null) {
            this._locationManager = new CLLocationManager()
            this._locationManager.delegate = this._locationListener
        }

        if (type == 'WhenInUse') {
            this._locationManager.requestWhenInUseAuthorization()
        } else {
            this._locationManager.requestAlwaysAuthorization()
        }

        return new Promise((resolve, reject) => {
            this._locationListener.setupPromise(resolve)
        })
    }
    /** CAMERA PERMISSIONS */


    public isCameraPresent(): boolean {
        return UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType['UIImagePickerControllerSourceTypeCamera'])
    }

    public isFrontCameraPresent(): boolean {
        return UIImagePickerController.isCameraDeviceAvailable(UIImagePickerControllerCameraDevice['UIImagePickerControllerCameraDeviceFront'])
    }

    public isRearCameraPresent(): boolean {
        return UIImagePickerController.isCameraDeviceAvailable(UIImagePickerControllerCameraDevice['UIImagePickerControllerCameraDeviceRear'])
    }

    public getCameraAuthorizationStatus(): number {
        return AVCaptureDevice.authorizationStatusForMediaType(AVMediaTypeVideo)
    }

    public isCameraAuthorized(): boolean {
        return this.getCameraAuthorizationStatus() == this.status['Camera']['Authorized']
    }

    public isCameraAvailable(): boolean {
        return this.isCameraPresent() && this.isCameraAuthorized()
    }

    public requestCameraAuthorization(): Promise<any> {
        return new Promise(function(resolve) {
            AVCaptureDevice.requestAccessForMediaTypeCompletionHandler(AVMediaTypeVideo, resolve)
        })
    }

    /** Photoreel Permissions */

    public getPicturesAuthorizationStatus(): number {
        return PHPhotoLibrary.authorizationStatus()
    }

    public isPicturesAuthorized(): boolean {
        return this.getPicturesAuthorizationStatus() == this.status['Pictures']['Authorized']
    }

    public requestPicturesAuthorization(): Promise<any> {
        return new Promise((resolve) => {
            PHPhotoLibrary.requestAuthorization((status) => {
                return resolve(status == this.status['Pictures']['Authorized'])
            })
        })
    }

    /** CONTACT PERMS */
    public getContactsAuthorizationStatus(): number {
        return ABAddressBookGetAuthorizationStatus()
    }

    public isContactsAuthorized(): boolean {
        return this.getContactsAuthorizationStatus() == this.status['Contacts']['Authorized']
    }

    public requestContactsAuthorization(): Promise<any> {
        return new Promise((resolve, reject) => {
            ABAddressBookRequestAccessWithCompletion(this.addressBook, function(status, error) {
                if (error) {
                    return reject(new Error(error))
                } else {
                    return resolve(status)
                }
            })
        })
    }

    /** MICROPHONE PERMS */
    public getMicrophoneAuthorizationStatus(): number {
        let session = AVAudioSession.sharedInstance()
        return session.recordPermission()
    }

    public isMicrophoneAuthorized(): boolean {
        return this.getMicrophoneAuthorizationStatus() == this.status['Microphone']['Granted']
    }

    public requestMicrophoneAuthorization(): Promise<any> {
        let session = AVAudioSession.sharedInstance()
        return new Promise(function(resolve) {
            session.requestRecordPermission(function(status) {
                return resolve(status)
            })
        })
    }

    /** Calendar Perms */

    public getCalendarAuthorizationStatus(): number {
        return EKEventStore.authorizationStatusForEntityType(EKEntityTypeEvent)
    }

    public isCalendarAuthorized(): boolean {
        return this.getCalendarAuthorizationStatus() == this.status['Calendar']['Authorized']
    }

    public requestCalendarAuthorization(): Promise<any> {
        if (this._eventStore == null) {
            this._eventStore = new EKEventStore()
        }
        return new Promise((resolve, reject) => {
            this._eventStore.requestAccessToEntityTypeCompletion(EKEntityTypeEvent, function(status, error) {
                if (error) {
                    return reject(new Error(error))
                } else {
                    return resolve(status)
                }
            })
        })
    }
}

export default new DiagnosticsIOS();