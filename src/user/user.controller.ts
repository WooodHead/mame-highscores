import {
  Body,
  ClassSerializerInterceptor,
  Controller, Delete,
  Get, OnModuleInit,
  Param,
  Post, Put,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { User } from '../entity/user.entity';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from "../auth/auth.service";
import { isEmpty } from 'lodash'
import { ModuleRef } from "@nestjs/core";
import { Score } from "../entity/score.entity";
import { ConfigService } from "../config/config.service";
import { Game } from "../entity/game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Controller('user')
@UseGuards(AuthGuard())
@UseInterceptors(ClassSerializerInterceptor)
export class UserController implements OnModuleInit{

  private authService: AuthService;

  constructor(private readonly userService: UserService,
              private readonly config: ConfigService,
              @InjectRepository(Game)
              private readonly gameRepository: Repository<Game>,
              private readonly  moduleRef: ModuleRef) {
  }

  onModuleInit() {
    this.authService = this.moduleRef.get(AuthService, {strict: false});
  }

  @Post('invite')
  async invite(@Req() req, @Body() body) {
    const groupId = req.user.groupId;
    const inviteEmail = body.inviteEmail;
    const result = await this.userService.inviteUser(groupId, inviteEmail);

    return {success: true, inviteLink: `${this.config.getBaseUrl()}/#/register/${result.inviteCode}`}
  }


  @Put(':id')
  async save(@Param('id') id, @Req() req, @Body() body){
    const groupId = req.user.groupId;
    const userId = req.user.user.id;

    if(userId != id){
      throw "can only update yourself";
    }

    let user = await this.userService.findOne(userId, groupId);

    if (!user) {
      throw "User not found"
    }

    if(!isEmpty(body.currentPassword)){
      const isValidPassword = await this.authService.isValidPassword(body.currentPassword, user.password);
      if(!isValidPassword){
        throw "Invalid current password"
      }

      if(body.newPassword !== body.repeatNewPassword){
        throw "Passwords do not match"
      }

      user.password = await this.authService.hashPassword(body.newPassword);
      //user.email = body.email;
    }


    return await this.userService.save(user);
  }

  @Delete(':id')
  async delete(@Param('id') id, @Req() req, @Body() body){

    const groupId = req.user.groupId;
    const loggedInUserId = req.user.user.id;

    if(parseInt(loggedInUserId) === parseInt(id)){
      throw "Can't delete yourself"
    }

    const loggedInUser = await this.userService.findOne(loggedInUserId, groupId);

    if(!loggedInUser.isAdmin){
      throw "Access denied"
    }

    const userToDelete = await this.userService.findOne(id, groupId);
    return await this.userService.delete(userToDelete);
  }


  @Get(':id')
  async findOne(@Param('id') id, @Req() req): Promise<User> {
    const groupId = req.user.groupId;
    let user = await this.userService.findOne(id, groupId);
    let userPoints = await this.userService.getPoints(groupId, user.id);
     // console.log(userPoints);
    user.points = (userPoints.length === 0) ? 0 : userPoints[0].total_points;
    // console.log(user);
    return user;
  }

  @Get()
  async find(@Req() req): Promise<User[]> {
    const groupId = req.user.groupId;
    return await this.userService.find(groupId);
  }

  /**
   * Gets the games this user has played
   * @param id
   */
  @Get(':id/games')
  async findGames(@Param('id') id, @Req() req): Promise<Game[]>{

    const groupId = req.user.groupId;

    return await this.gameRepository.createQueryBuilder('game')
      .innerJoinAndSelect('game.scores', 's')
      .innerJoin('s.alias', 'a', 's.alias_id = a.id')
      .innerJoin('a.userGroup', 'ug')

      .where('ug.group_id = :groupId', {groupId})
      .andWhere( 'ug.user_id = :userId', {userId: id})
      .orderBy('game.name').addOrderBy('s.rank')
      .getMany();


  }

}
