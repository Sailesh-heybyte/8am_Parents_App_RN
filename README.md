# 8am Parents App

React Native app (`EightAMParent`). Node **22.11 or newer**.

## First time only

```sh
npm install
```

iOS also needs pods (Mac only, once, and again after native dependency changes):

```sh
bundle install
bundle exec pod install --project-directory=ios
```

## Start the app

Always start Metro first, in one terminal:

```sh
npm start
```

Leave it running. Use a second terminal for the commands below.

### With emulator / simulator

Android emulator (start the emulator in Android Studio first, or let the command boot one):

```sh
npm run android
```

iOS Simulator (Mac only):

```sh
npm run ios
```

### Without emulator (real phone)

**Android phone**

1. On the phone: Settings → Developer options → USB debugging on.
2. Plug in the phone and accept the USB prompt.
3. Run:

```sh
npm run android
```

If the phone cannot reach Metro:

```sh
adb reverse tcp:8081 tcp:8081
```

**iPhone** (Mac only)

1. Plug in the phone and trust the computer.
2. Run:

```sh
npm run ios -- --device
```

Pick your phone from the list. The first run needs a signing team in Xcode (`ios/EightAMParent.xcworkspace`).

### App already installed

You only need Metro. Open the app on the phone or emulator:

```sh
npm start
```

Reload: press `r` in the Metro terminal.

## Everyday commands

| What | Command |
| --- | --- |
| Metro | `npm start` |
| Android (emulator or USB phone) | `npm run android` |
| iOS Simulator | `npm run ios` |
| iPhone | `npm run ios -- --device` |
