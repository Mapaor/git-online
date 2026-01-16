import { CommandMap } from './types';
import { cat } from './cat';
import { cd } from './cd';
import { clear } from './clear';
import { cp } from './cp';
import { echo } from './echo';
import { grep } from './grep';
import { ls } from './ls';
import { mkdir } from './mkdir';
import { mv } from './mv';
import { pwd } from './pwd';
import { rm } from './rm';
import { tail } from './tail';
import { touch } from './touch';
import { help } from './help';
import { exit } from './exit';
import { gitCommand } from './git';

export const commands: CommandMap = {
  cat,
  cd,
  clear,
  cp,
  echo,
  grep,
  ls,
  mkdir,
  mv,
  pwd,
  rm,
  tail,
  touch,
  help,
  exit,
  git: gitCommand,
};
