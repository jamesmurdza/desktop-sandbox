import { 
	Sandbox as SandboxBase,
	CreateSandboxOptions as SandboxOptionsBase, 
	RunCommandOptions 
} from '@gitwit/sandbox'

import { generateRandomString, mapKey, mapMouseButton } from './utils.js'

interface CursorPosition {
	x: number
	y: number
}

interface ScreenSize {
	width: number
	height: number
}

/**
 * Configuration options for the Sandbox environment.
 * @interface SandboxOpts
 * @extends {SandboxOptionsBase}
 */
export interface SandboxOpts extends SandboxOptionsBase {
	/**
	 * The screen resolution in pixels, specified as [width, height].
	 * @type {[number, number]}
	 */
	resolution?: [number, number]

	/**
	 * Dots per inch (DPI) setting for the display.
	 * @type {number}
	 */
	dpi?: number

	/**
	 * Display identifier.
	 * @type {string}
	 */
	display?: string
}


export class Sandbox {
	private baseSandbox: SandboxBase
	public display: string = ':0'
	public stream: VNCServer = new VNCServer(this)
	private lastXfce4Pid: number | null = null

	private constructor(baseSandbox: SandboxBase) {
		this.baseSandbox = baseSandbox
	}

	/**
	 * Create a new sandbox from the default `desktop` sandbox template.
	 *
	 * @param provider provider to use.
	 * @param opts connection options.
	 *
	 * @returns sandbox instance for the new sandbox.
	 *
	 * @example
	 * ```ts
	 * const sandbox = await Sandbox.create()
	 * ```
	 * @constructs Sandbox
	 */
	static async create(
		provider: string,
		opts?: SandboxOpts & { template?: string }
	): Promise<Sandbox> {
		const display = opts?.display || ':0'
		const sandboxOpts = {
			...opts,
			envs: { ...opts?.envs, DISPLAY: display },
			template: opts?.template ?? "gitwit-desktop",
		}
		const baseSandbox = await SandboxBase.create(provider, sandboxOpts)
		const desktopSandbox = new Sandbox(baseSandbox)
		await desktopSandbox._start(display, sandboxOpts)

		return desktopSandbox
	}

	// Delegate all base sandbox methods
  /**
   * Start a new command and wait until it finishes executing.
   * 
   * @param command Command to run
   * @param options Options for running the command
   */
  async runCommand(
	command: string,
	options?: RunCommandOptions & { background?: false }
  ): Promise<{ exitCode: number; output: string }>;
  /**
   * Start a new command in background and return its process ID.
   * 
   * @param command Command to run
   * @param options Options for running the command
   */
  async runCommand(
    command: string,
    options?: RunCommandOptions & { background: true }
  ): Promise<{ pid: number }>;
  async runCommand(
	command: string,
	options?: RunCommandOptions & { background?: boolean }
  ): Promise<{ exitCode: number; output: string } | { pid: number }> {
	if (options?.background) {
		return this.baseSandbox.runCommand(command, { ...options, background: true })
	} else {
		return this.baseSandbox.runCommand(command, { ...options, background: false })
	}
}

	id(): string {
		return this.baseSandbox.id()
	}

	async suspend(): Promise<void> {
		return this.baseSandbox.suspend()
	}

	async resume(): Promise<void> {
		return this.baseSandbox.resume()
	}

	async destroy(): Promise<void> {
		return this.baseSandbox.destroy()
	}

	async readFile(path: string, options?: any): Promise<any> {
		return this.baseSandbox.readFile(path, options)
	}

	async writeFile(path: string, content: string | Uint8Array): Promise<void> {
		return this.baseSandbox.writeFile(path, content)
	}

	async listFiles(path: string): Promise<Array<any>> {
		return this.baseSandbox.listFiles(path)
	}

	async moveFile(path: string, newPath: string): Promise<void> {
		return this.baseSandbox.moveFile(path, newPath)
	}

	async deleteFile(path: string): Promise<void> {
		return this.baseSandbox.deleteFile(path)
	}

	async createDirectory(path: string): Promise<void> {
		return this.baseSandbox.createDirectory(path)
	}

	async getPreviewUrl(port: number): Promise<string> {
		return this.baseSandbox.getPreviewUrl(port)
	}

	async createTerminal(onOutput: (output: string) => void): Promise<any> {
		return this.baseSandbox.createTerminal(onOutput)
	}

	/**
	 * Wait for a command to return a specific result.
	 * @param cmd - The command to run.
	 * @param onResult - The function to check the result of the command.
	 * @param timeout - The maximum time to wait for the command to return the result.
	 * @param interval - The interval to wait between checks.
	 * @returns `true` if the command returned the result within the timeout, otherwise `false`.
	 */
	async waitAndVerify(
		cmd: string,
		onResult: (result: { exitCode: number; output: string }) => boolean,
		timeout: number = 10,
		interval: number = 0.5
	): Promise<boolean> {
		let elapsed = 0

		while (elapsed < timeout) {
			if (onResult(await this.runCommand(cmd))) {
				return true
			}

			await new Promise((resolve) => setTimeout(resolve, interval * 1000))
			elapsed += interval
		}

		return false
	}

	/**
	 * Take a screenshot and save it to the given name.
	 * @returns A Uint8Array bytes representation of the screenshot.
	 */
	async screenshot() {
		const path = `/tmp/screenshot-${generateRandomString()}.png`
		await this.runCommand(`scrot --pointer ${path}`)

		const imageBytes = await this.readFile(path, { format: 'bytes' })
		await this.deleteFile(path)
		return imageBytes
	}

	/**
	 * Left click on the mouse position.
	 */
	async leftClick(x?: number, y?: number): Promise<void> {
		if (x && y) {
			await this.moveMouse(x, y)
		}

		await this.runCommand('xdotool click 1')
	}

	/**
	 * Double left click on the mouse position.
	 */
	async doubleClick(x?: number, y?: number): Promise<void> {
		if (x && y) {
			await this.moveMouse(x, y)
		}

		await this.runCommand('xdotool click --repeat 2 1')
	}

	/**
	 * Right click on the mouse position.
	 */
	async rightClick(x?: number, y?: number): Promise<void> {
		if (x && y) {
			await this.moveMouse(x, y)
		}

		await this.runCommand('xdotool click 3')
	}

	/**
	 * Middle click on the mouse position.
	 */
	async middleClick(x?: number, y?: number): Promise<void> {
		if (x && y) {
			await this.moveMouse(x, y)
		}

		await this.runCommand('xdotool click 2')
	}

	/**
	 * Scroll the mouse wheel by the given amount.
	 * @param direction - The direction to scroll. Can be "up" or "down".
	 * @param amount - The amount to scroll.
	 */
	async scroll(
		direction: 'up' | 'down' = 'down',
		amount: number = 1
	): Promise<void> {
		const button = direction === 'up' ? '4' : '5'
		await this.runCommand(`xdotool click --repeat ${amount} ${button}`)
	}

	/**
	 * Move the mouse to the given coordinates.
	 * @param x - The x coordinate.
	 * @param y - The y coordinate.
	 */
	async moveMouse(x: number, y: number): Promise<void> {
		await this.runCommand(`xdotool mousemove --sync ${x} ${y}`)
	}

	/**
	 * Press the mouse button.
	 */
	async mousePress(
		button: 'left' | 'right' | 'middle' = 'left'
	): Promise<void> {
		await this.runCommand(`xdotool mousedown ${mapMouseButton(button)}`)
	}

	/**
	 * Release the mouse button.
	 */
	async mouseRelease(
		button: 'left' | 'right' | 'middle' = 'left'
	): Promise<void> {
		await this.runCommand(`xdotool mouseup ${mapMouseButton(button)}`)
	}

	/**
	 * Get the current cursor position.
	 * @returns A object with the x and y coordinates
	 * @throws Error if cursor position cannot be determined
	 */
	async getCursorPosition(): Promise<CursorPosition> {
		const result = await this.runCommand('xdotool getmouselocation')

		const match = result.output.match(/x:(\d+)\s+y:(\d+)/)
		if (!match) {
			throw new Error(
				`Failed to parse cursor position from output: ${result.output}`
			)
		}

		const [, x, y] = match
		if (!x || !y) {
			throw new Error(`Invalid cursor position values: x=${x}, y=${y}`)
		}

		return { x: parseInt(x), y: parseInt(y) }
	}

	/**
	 * Get the current screen size.
	 * @returns An {@link ScreenSize} object
	 * @throws Error if screen size cannot be determined
	 */
	async getScreenSize(): Promise<ScreenSize> {
		const result = await this.runCommand('xrandr')

		const match = result.output.match(/(\d+x\d+)/)
		if (!match) {
			throw new Error(
				`Failed to parse screen size from output: ${result.output}`
			)
		}

		try {
			const [width, height] = match[1].split('x').map((val) => parseInt(val))
			return { width, height }
		} catch (error) {
			throw new Error(`Invalid screen size format: ${match[1]}`)
		}
	}

	/**
	 * Write the given text at the current cursor position.
	 * @param text - The text to write.
	 * @param options - An object containing the chunk size and delay between each chunk of text.
	 * @param options.chunkSize - The size of each chunk of text to write. Default is 25 characters.
	 * @param options.delayInMs - The delay between each chunk of text. Default is 75 ms.
	 */
	async write(
		text: string,
		options: { chunkSize: number; delayInMs: number } = {
			chunkSize: 25,
			delayInMs: 75,
		}
	): Promise<void> {
		const chunks = this.breakIntoChunks(text, options.chunkSize)

		for (const chunk of chunks) {
			await this.runCommand(
				`xdotool type --delay ${options.delayInMs} -- ${this.quoteString(
					chunk
				)}`
			)
		}
	}

	/**
	 * Press a key.
	 * @param key - The key to press (e.g. "enter", "space", "backspace", etc.). Can be a single key or an array of keys.
	 */
	async press(key: string | string[]): Promise<void> {
		if (Array.isArray(key)) {
			key = key.map(mapKey).join('+')
		} else {
			key = mapKey(key)
		}

		await this.runCommand(`xdotool key ${key}`)
	}

	/**
	 * Drag the mouse from the given position to the given position.
	 * @param from - The starting position.
	 * @param to - The ending position.
	 */
	async drag(
		[x1, y1]: [number, number],
		[x2, y2]: [number, number]
	): Promise<void> {
		await this.moveMouse(x1, y1)
		await this.mousePress()
		await this.moveMouse(x2, y2)
		await this.mouseRelease()
	}

	/**
	 * Wait for the given amount of time.
	 * @param ms - The amount of time to wait in milliseconds.
	 */
	async wait(ms: number): Promise<void> {
		await this.runCommand(`sleep ${ms / 1000}`)
	}

	/**
	 * Open a file or a URL in the default application.
	 * @param fileOrUrl - The file or URL to open.
	 */
	async open(fileOrUrl: string): Promise<void> {
		await this.runCommand(`xdg-open ${fileOrUrl}`, {
			background: true,
		})
	}

	/**
	 * Get the current window ID.
	 * @returns The ID of the current window.
	 */
	async getCurrentWindowId(): Promise<string> {
		const result = await this.runCommand('xdotool getwindowfocus')
		return result.output.trim()
	}

	/**
	 * Get the window ID of the window with the given title.
	 * @param title - The title of the window.
	 * @returns The ID of the window.
	 */
	async getApplicationWindows(application: string): Promise<string[]> {
		const result = await this.runCommand(
			`xdotool search --onlyvisible --class ${application}`
		)

		return result.output.trim().split('\n')
	}

	/**
	 * Get the title of the window with the given ID.
	 * @param windowId - The ID of the window.
	 * @returns The title of the window.
	 */
	async getWindowTitle(windowId: string): Promise<string> {
		const result = await this.runCommand(`xdotool getwindowname ${windowId}`)

		return result.output.trim()
	}

	/**
	 * Launch an application.
	 * @param application - The application to launch.
	 * @param uri - The URI to open in the application.
	 */
	async launch(application: string, uri?: string): Promise<void> {
		await this.runCommand(`gtk-launch ${application} ${uri ?? ''}`, {
			background: true,
			timeoutMs: 0,
		})
	}

	protected async _start(display: string, opts?: SandboxOpts): Promise<void> {
		this.display = display
		this.lastXfce4Pid = null
		this.stream = new VNCServer(this)

		const [width, height] = opts?.resolution ?? [1024, 768]
		await this.runCommand(
			`Xvfb ${display} -ac -screen 0 ${width}x${height}x24 ` +
				`-retro -dpi ${opts?.dpi ?? 96} -nolisten tcp -nolisten unix`,
			{ background: true, timeoutMs: 0 }
		)
		const hasStarted = await this.waitAndVerify(
			`xdpyinfo -display ${display}`,
			(r: { exitCode: number; output: string }) => r.exitCode === 0,
		)
		if (!hasStarted) {
			throw new Error('Could not start Xvfb')
		}

		await this.startXfce4()
	}

	/**
	 * Start xfce4 session if logged out or not running.
	 */
	private async startXfce4(): Promise<void> {
		if (
			this.lastXfce4Pid === null ||
			(
				await this.runCommand(
					`ps aux | grep ${this.lastXfce4Pid} | grep -v grep | head -n 1`
				)
			).output
				.trim()
				.includes('[xfce4-session] <defunct>')
		) {
			const result = await this.runCommand('startxfce4', {
				background: true,
				timeoutMs: 0,
			})
			this.lastXfce4Pid = result.pid
		}
	}

	private *breakIntoChunks(text: string, n: number): Generator<string> {
		for (let i = 0; i < text.length; i += n) {
			yield text.slice(i, i + n)
		}
	}

	private quoteString(s: string): string {
		if (!s) {
			return "''"
		}

		if (!/[^\w@%+=:,./-]/.test(s)) {
			return s
		}

		// use single quotes, and put single quotes into double quotes
		// the string $'b is then quoted as '$'"'"'b'
		return "'" + s.replace(/'/g, "'\"'\"'") + "'"
	}
}

interface VNCServerOptions {
	vncPort?: number
	port?: number
	requireAuth?: boolean
	windowId?: string
}

interface UrlOptions {
	autoConnect?: boolean
	viewOnly?: boolean
	resize?: 'off' | 'scale' | 'remote'
	authKey?: string
}

// Modified VNCServer class
class VNCServer {
	private vncPort: number = 5900
	private port: number = 6080
	private novncAuthEnabled: boolean = false
	private url: URL | null = null
	private noVNCPID: number | null = null
	private password: string | undefined
	private readonly novncCommand: string
	private readonly desktop: Sandbox

	constructor(desktop: Sandbox) {
		this.desktop = desktop
		this.novncCommand =
			`cd /opt/noVNC/utils && ./novnc_proxy --vnc localhost:${this.vncPort} ` +
			`--listen ${this.port} --web /opt/noVNC > /tmp/novnc.log 2>&1`
	}

	public getAuthKey(): string {
		if (!this.password) {
			throw new Error(
				'Unable to retrieve stream auth key, check if requireAuth is enabled'
			)
		}

		return this.password
	}

	/**
	 * Get the URL to a web page with a stream of the desktop sandbox.
	 * @param autoConnect - Whether to automatically connect to the server after opening the URL.
	 * @param viewOnly - Whether to prevent user interaction through the client.
	 * @param resize - Whether to resize the view when the window resizes.
	 * @param authKey - The password to use to connect to the server.
	 * @returns The URL to connect to the VNC server.
	 */
	public getUrl({
		autoConnect = true,
		viewOnly = false,
		resize = 'scale',
		authKey,
	}: UrlOptions = {}): string {
		if (this.url === null) {
			throw new Error('Server is not running')
		}

		const url = new URL(this.url)
		if (autoConnect) {
			url.searchParams.set('autoconnect', 'true')
		}
		if (viewOnly) {
			url.searchParams.set('view_only', 'true')
		}
		if (resize) {
			url.searchParams.set('resize', resize)
		}
		if (authKey) {
			url.searchParams.set('password', authKey)
		}
		return url.toString()
	}

	/**
	 * Start the VNC server.
	 */
	public async start(opts: VNCServerOptions = {}): Promise<void> {
		// If stream is already running, throw an error.
		if (await this.checkVNCRunning()) {
			throw new Error('Stream is already running')
		}

		this.vncPort = opts.vncPort ?? this.vncPort
		this.port = opts.port ?? this.port
		this.novncAuthEnabled = opts.requireAuth ?? this.novncAuthEnabled
		this.password = this.novncAuthEnabled ? generateRandomString() : undefined
		this.url = new URL(`${await this.desktop.getPreviewUrl(this.port)}/vnc.html`)

		const vncCommand = await this.getVNCCommand(opts.windowId)
		await this.desktop.runCommand(vncCommand)

		this.noVNCPID = (await this.desktop.runCommand(this.novncCommand, {
			background: true,
			timeoutMs: 0,
		})).pid
		if (!(await this.waitForPort(this.port))) {
			throw new Error('Could not start noVNC server')
		}
	}

	/**
	 * Stop the VNC server.
	 */
	public async stop(): Promise<void> {
		if (await this.checkVNCRunning()) {
			await this.desktop.runCommand('pkill x11vnc')
		}

		if (this.noVNCPID) {
			await this.desktop.runCommand(`kill ${this.noVNCPID}`)
			this.noVNCPID = null
		}
	}

	/**
	 * Set the VNC command to start the VNC server.
	 */
	private async getVNCCommand(windowId?: string): Promise<string> {
		let pwdFlag = '-nopw'
		if (this.novncAuthEnabled) {
			// Create .vnc directory if it doesn't exist
			await this.desktop.runCommand('mkdir -p ~/.vnc')
			await this.desktop.runCommand(
				`x11vnc -storepasswd ${this.password} ~/.vnc/passwd`
			)
			pwdFlag = '-usepw'
		}

		return (
			`x11vnc -bg -display ${this.desktop.display} -forever -wait 50 -shared ` +
			`-rfbport ${this.vncPort} ${pwdFlag} 2>/tmp/x11vnc_stderr.log` +
			(windowId ? ` -id ${windowId}` : '')
		)
	}

	private async waitForPort(port: number): Promise<boolean> {
		return await this.desktop.waitAndVerify(
			`netstat -tuln | grep ":${port} "`,
			(r: { exitCode: number; output: string }) => r.output.trim() !== ''
		)
	}

	/**
	 * Check if the VNC server is running.
	 * @returns Whether the VNC server is running.
	 */
	private async checkVNCRunning(): Promise<boolean> {
		try {
			const result = await this.desktop.runCommand('pgrep -x x11vnc')
			return result.exitCode === 0
		} catch (error) {
			return false
		}
	}
}
