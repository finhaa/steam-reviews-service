import { Game } from '../entities/game.entity';

export interface GameRepository {
  findById(id: number): Promise<Game | null>;
  findByAppId(appId: number): Promise<Game | null>;
  findAll(): Promise<Game[]>;
  create(game: Game): Promise<Game>;
}
