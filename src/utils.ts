import { randomBytes } from 'crypto'

const MOUSE_BUTTONS = {
  left: 1,
  right: 3,
  middle: 2,
}

const KEYS = {
  alt: 'Alt_L',
  alt_left: 'Alt_L',
  alt_right: 'Alt_R',
  backspace: 'BackSpace',
  break: 'Pause',
  caps_lock: 'Caps_Lock',
  cmd: 'Super_L',
  command: 'Super_L',
  control: 'Control_L',
  control_left: 'Control_L',
  control_right: 'Control_R',
  ctrl: 'Control_L',
  del: 'Delete',
  delete: 'Delete',
  down: 'Down',
  end: 'End',
  enter: 'Return',
  esc: 'Escape',
  escape: 'Escape',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  home: 'Home',
  insert: 'Insert',
  left: 'Left',
  menu: 'Menu',
  meta: 'Meta_L',
  num_lock: 'Num_Lock',
  page_down: 'Page_Down',
  page_up: 'Page_Up',
  pause: 'Pause',
  print: 'Print',
  right: 'Right',
  scroll_lock: 'Scroll_Lock',
  shift: 'Shift_L',
  shift_left: 'Shift_L',
  shift_right: 'Shift_R',
  space: 'space',
  super: 'Super_L',
  super_left: 'Super_L',
  super_right: 'Super_R',
  tab: 'Tab',
  up: 'Up',
  win: 'Super_L',
  windows: 'Super_L',
}

export function mapKey(key: string): string {
  const lowerKey = key.toLowerCase()
  if (lowerKey in KEYS) {
    return KEYS[lowerKey as keyof typeof KEYS]
  }
  return lowerKey
}

export function mapMouseButton(button: string): number {
  const lowerButton = button.toLowerCase()
  if (lowerButton in MOUSE_BUTTONS) {
    return MOUSE_BUTTONS[lowerButton as keyof typeof MOUSE_BUTTONS]
  }
  return 1
}

export function generateRandomString(length: number = 16): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = randomBytes(length)
  let result = ''

  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length]
  }

  return result
}
