import { CANVAS_WIDTH } from '@/game/constants';

interface InputState {
  left: boolean;
  right: boolean;
  accelerate: boolean;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private input: InputState = { left: false, right: false, accelerate: false };
  private touchX: number | null = null;
  private isDragging: boolean = false;

  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundHandleKeyUp: (e: KeyboardEvent) => void;
  private boundHandleTouchStart: (e: TouchEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleTouchEnd: (e: TouchEvent) => void;
  private boundHandleMouseDown: (e: MouseEvent) => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleMouseUp: (e: MouseEvent) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundHandleKeyUp = this.handleKeyUp.bind(this);
    this.boundHandleTouchStart = this.handleTouchStart.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this);
    this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
    this.boundHandleMouseDown = this.handleMouseDown.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleMouseUp = this.handleMouseUp.bind(this);

    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', this.boundHandleKeyDown);
    window.addEventListener('keyup', this.boundHandleKeyUp);

    this.canvas.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.boundHandleTouchEnd);

    this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.addEventListener('mouseleave', this.boundHandleMouseUp);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        this.input.left = true;
        e.preventDefault();
        break;
      case 'd':
      case 'arrowright':
        this.input.right = true;
        e.preventDefault();
        break;
      case 'shift':
        this.input.accelerate = true;
        e.preventDefault();
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'a':
      case 'arrowleft':
        this.input.left = false;
        break;
      case 'd':
      case 'arrowright':
        this.input.right = false;
        break;
      case 'shift':
        this.input.accelerate = false;
        break;
    }
  }

  private getCanvasX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    return (clientX - rect.left) * scaleX;
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.isDragging = true;
      this.touchX = this.getCanvasX(e.touches[0].clientX);
      e.preventDefault();
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (this.isDragging && e.touches.length > 0) {
      this.touchX = this.getCanvasX(e.touches[0].clientX);
      e.preventDefault();
    }
  }

  private handleTouchEnd(): void {
    this.isDragging = false;
    this.touchX = null;
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.touchX = this.getCanvasX(e.clientX);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging) {
      this.touchX = this.getCanvasX(e.clientX);
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.touchX = null;
  }

  getInput(): InputState {
    return { ...this.input };
  }

  getTouchX(): number | null {
    if (this.touchX !== null) {
      return Math.max(0, Math.min(CANVAS_WIDTH, this.touchX));
    }
    return null;
  }

  reset(): void {
    this.input = { left: false, right: false, accelerate: false };
    this.touchX = null;
    this.isDragging = false;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
    window.removeEventListener('keyup', this.boundHandleKeyUp);

    this.canvas.removeEventListener('touchstart', this.boundHandleTouchStart);
    this.canvas.removeEventListener('touchmove', this.boundHandleTouchMove);
    this.canvas.removeEventListener('touchend', this.boundHandleTouchEnd);

    this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.boundHandleMouseUp);
  }
}
