# <em>Web<sup>3</sup></em>

This repo uses VSCode's Dev Containers extension to standardize the development environment and avoid headache-inducing installation. All development will happen inside a Docker container which installs the same dependencies and versions on every developer's machine.

## Installation
0. Using Windows? First set up WSL 2.
    - Press Windows `⊞` -> "Turn Windows features on or off". Enable "Windows Subsystem for Linux".
    - Open Powershell as admin.
    - `wsl --install`  
    - `wsl --set-default-version 2`
    - `wsl --install -d Ubuntu-22.04`
    - `wsl --set-default Ubuntu-22.04`
    -  For more info: [Microsoft documentation](https://learn.microsoft.com/en-us/windows/wsl/install)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and run it.

    - Windows users: Make sure you select Use WSL 2 instead of Hyper-V if the option is presented.

2. Open a new VSCode window and install Dev Containers extension from the Extensions menu.
 
3. Open the Command Palette (`Ctrl + Shift + P` / `Cmd + Shift + P`) and select `Dev Containers: Clone Repository in Container Volume...`. Select `GitHub`, then enter `fsek/WWW-Web.git`.

4. After configuration has finished in the open terminal, it should say `Done. Press any key to close the terminal`. 

5. Open a new Bash terminal (`Ctrl + Shift + Ö`) and run: `bun install`, `bun run generate-api` and then `bun run dev` ([backend application](https://github.com/fsek/WebWebWeb) needs to be active for both of these to work as wanted).

    - If you start WebWebWeb in a VSCode window, closing the window or switching to WWW-Web in the same VSCode window will terminate the backend. Open another window instead.

6. Go to http://127.0.0.1:3000/ (or http://localhost:3000/admin) for the website where you can see the project🎉🥳🇱 🇬 🇹 🇲

7. From now on, whenever you want to open this project: Open a new VSCode window and in Recent, find `WWW-Web in a unique volume [Dev Container]`. Don't re-run `Clone Repository...` from step 3.

## Troubleshooting
- `Ctrl + Shift + P` and type `Rebuild Container`.
- Check if you alredy have an open port in the port window in VSCode. Delete it, press `Ctrl + Shift + P` and type `Rebuild Container`.

## Working on WWW-Web
- To install new components:
    - Go to https://ui.shadcn.com/
    - Follow the instructions there


## Tips and tricks
- Use https://www.creative-tim.com/twcomponents/cheatsheet to find different Tailwind css classes