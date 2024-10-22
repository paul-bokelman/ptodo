# Physical Reward System

A physical reward system based on the principle of classical conditioning.

## Project motivation

I wanted a good and efficient todo application, but I also wanted to mess with a micro-controller that I had laying around.

## In Action

https://github.com/paul-bokelman/prs/assets/72945168/78815b88-769b-4055-90be-8d0899e63ed8

## Features

- Create, update and delete tasks (through the website)
- Change task status (through the website & hardware)
- View tasks by date
- Simple tagging system to categorize tasks
- Real-time updates
- Task metrics (streak, total completed, completion rate, etc.)
- Full hardware integration with websockets

## How it works

The system comprises a React website, an Express server, and a micro-controller. Connected to the micro-controller are several buttons and LEDs, each triggering distinct events sent through a WebSocket to the server. Subsequently, the server broadcasts these events to all connected clients, which then update their state and present the new state to the user. With this setup, users can progress through their current tasks and mark them as completed without needing to interact directly with their computer.

To motivate users and incentivize task completion, the system employs a combination of a large red arcade button and a randomly selected retro completion sound. This approach aims to instill a sense of accomplishment and encourage users to stay engaged with their tasks.

## The Hardware

![prs](https://github.com/paul-bokelman/prs/assets/72945168/baa7ec56-547c-4103-8898-5f00f84719d9)

The hardware is composed of a NodeMCU micro-controller, a few buttons, and a few LED's. All of the programming was done in C++ using the Arduino IDE. Currently, the system is connected to a breadboard, but the final version will be soldered to a PCB and powered independently.

### Connectivity LED Indicators

The statuses are the states that the system can be in. The system can be in one of the following states:

Connected
![IMG_1981](https://github.com/paul-bokelman/prs/assets/72945168/a4f84c4d-e820-43a6-a7fa-14250e131a73)

Connecting
![IMG_1982](https://github.com/paul-bokelman/prs/assets/72945168/d4fcb914-f2b0-46e1-b56f-6ee290471e4d)

Disconnected / Error
![IMG_1986](https://github.com/paul-bokelman/prs/assets/72945168/6f7f36de-f4b2-4c83-9901-27ec770db67a)

### Changelog

All notable changes related to the hardware of the PRS are documented in this [file](hardware/changelog.md).

## Website demo

A basic demo of the website that doesn't utilize the hardware:

https://github.com/paul-bokelman/prs/assets/72945168/ff48c499-8454-400a-9ecb-ab54ddd0133b
