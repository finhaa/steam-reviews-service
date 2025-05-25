export class Game {
  constructor(
    public readonly id: number,
    public readonly appId: number,
    public readonly name: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
