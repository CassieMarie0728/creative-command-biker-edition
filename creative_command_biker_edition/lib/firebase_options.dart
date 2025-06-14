// File generated by FlutterFire CLI.
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart'
    show defaultTargetPlatform, kIsWeb, TargetPlatform;

/// Default [FirebaseOptions] for use with your Firebase apps.
///
/// Example:
/// ```dart
/// import 'firebase_options.dart';
/// // ...
/// await Firebase.initializeApp(
///   options: DefaultFirebaseOptions.currentPlatform,
/// );
/// ```
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
        return windows;
      case TargetPlatform.linux:
        throw UnsupportedError(
          'DefaultFirebaseOptions have not been configured for linux - '
          'you can reconfigure this by running the FlutterFire CLI again.',
        );
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyBfd9qq-6kzpc1AO4lR5DNepOiFNcx9LRU',
    appId: '1:678180931322:web:abc4e8b0d3da644b966b43',
    messagingSenderId: '678180931322',
    projectId: 'creative-command---biker-ed',
    authDomain: 'creative-command---biker-ed.firebaseapp.com',
    storageBucket: 'creative-command---biker-ed.firebasestorage.app',
    measurementId: 'G-JDNWG2Q79E',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBc1kRffx-ustepIw42-2bX670crr-uuzo',
    appId: '1:678180931322:android:07ef1017f72a937a966b43',
    messagingSenderId: '678180931322',
    projectId: 'creative-command---biker-ed',
    storageBucket: 'creative-command---biker-ed.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAUSO221BgaLT2Xl5llgLjrTjw4bgnyfo8',
    appId: '1:678180931322:ios:addde1a09db1b135966b43',
    messagingSenderId: '678180931322',
    projectId: 'creative-command---biker-ed',
    storageBucket: 'creative-command---biker-ed.firebasestorage.app',
    iosBundleId: 'com.example.creativeCommandBikerEdition',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAUSO221BgaLT2Xl5llgLjrTjw4bgnyfo8',
    appId: '1:678180931322:ios:addde1a09db1b135966b43',
    messagingSenderId: '678180931322',
    projectId: 'creative-command---biker-ed',
    storageBucket: 'creative-command---biker-ed.firebasestorage.app',
    iosBundleId: 'com.example.creativeCommandBikerEdition',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyBfd9qq-6kzpc1AO4lR5DNepOiFNcx9LRU',
    appId: '1:678180931322:web:b3c9e5e96c66c2af966b43',
    messagingSenderId: '678180931322',
    projectId: 'creative-command---biker-ed',
    authDomain: 'creative-command---biker-ed.firebaseapp.com',
    storageBucket: 'creative-command---biker-ed.firebasestorage.app',
    measurementId: 'G-W0G0VBM7QL',
  );
}
