import { GameManager } from './GameManager'

window.addEventListener('DOMContentLoaded', () => {
    const canvas: HTMLCanvasElement = document.getElementById('renderCanvas') as HTMLCanvasElement
    const gameManager = new GameManager({canvas})
});