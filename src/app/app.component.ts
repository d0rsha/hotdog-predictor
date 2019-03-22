import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
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


      window['FirebasePlugin'].setAnalyticsCollectionEnabled(true); // Enables analytics collection
      window['FirebasePlugin'].setPerformanceCollectionEnabled(true);

      window['FirebasePlugin'].logEvent('select_content', { content_type: 'page_view', item_id: 'home' });

      window['FirebasePlugin'].startTrace('test',
        (success: any) => {
          console.log('create trace "test_trace"', success)
          // tslint:disable-next-line:no-console
          console.time('test_trace')
        },
        (err: any) => console.error('Could not create trace "test_trace"'))
      window['FirebasePlugin'].stopTrace('test')

    });
  }
}
