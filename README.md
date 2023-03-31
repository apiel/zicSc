# Zic SuperCollider

ZicSc is a groovebox for Raspberry PI base on supercollider. The UI is use [SDL2](https://www.libsdl.org/) and NodeJS TypeScript to generate it, making the implementation/customisation much easier than using C++. Since it is using SDL, the UI don't need X server to render. There is no mouse interraction for the UI, everything is handled with a keyboard (or rotary encoder).

# Installation

```sh
sudo apt-get -y install libsdl2-ttf-dev libsdl2-ttf-2.0-0 libsdl2-dev

# TODO #15 fix recursive git repo
# TODO add nodejs addon in repo and update package.json
git clone --recursive https://github.com/apiel/zicSc.git
cd zicSc
npm install
npm start
```

## RPi

### node 16

```sh
  if [ "$(uname -m)" != "armv6l" ]; then
    curl -sL https://deb.nodesource.com/setup_16.x | bash -
  else
    wget -O - https://raw.githubusercontent.com/sdesalas/node-pi-zero/master/install-node-v16.3.0.sh | bash
  fi
  apt-get -y install nodejs
```

### font

```sh
sudo apt-get -y install fonts-liberation2
```

# Ressources

- [ZicNodeUI](https://github.com/apiel/zicNodeUI) C++ NodeJs addon for SDL2 user interface.
