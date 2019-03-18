import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public firebasePlugin = null;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      console.log(window)

      this.firebasePlugin = window['FirebasePlugin'];

      window['FirebasePlugin'].setPerformanceCollectionEnabled(true);
      window['FirebasePlugin'].setAnalyticsCollectionEnabled(true); // Enables analytics collection


      // tslint:disable-next-line:no-console
      console.time('AppInitialized_to_ionViewDidEnter()')
      window['FirebasePlugin'].startTrace('AppInitialized_to_ionViewDidEnter()',
        (success: any) => {
        },
        (err: any) => console.error('Could not create trace "test_trace"'))
    });
  }
}
