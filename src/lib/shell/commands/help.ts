import { ShellContext } from '../context';

export async function help(ctx: ShellContext) {
  ctx.write('Available commands:\n\n');
  ctx.write('File System:\n');
  ctx.write('  cat, cd, cp, ls, mkdir, mv, pwd, rm, tail, touch\n\n');
  ctx.write('Utilities:\n');
  ctx.write('  clear, echo, grep, help, exit\n\n');
  ctx.write('Git:\n');
  ctx.write('  git - Type "git" for git commands help\n\n');
  ctx.write('Examples:\n');
  ctx.write('  mkdir myproject && cd myproject\n');
  ctx.write('  git init\n');
  ctx.write('  echo "Hello World" > hello.txt\n');
  ctx.write('  git add .\n');
  ctx.write('  git commit -m "Initial commit"\n');
  ctx.write('  git log\n');
}
