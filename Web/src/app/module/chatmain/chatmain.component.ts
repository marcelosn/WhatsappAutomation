import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RobotService } from 'src/app/core/services/robot.service';
import { UserService } from 'src/app/core/services/user.service';
import { Observable, Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { delay } from 'q';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-chatmain',
  templateUrl: './chatmain.component.html',
  styleUrls: ['./chatmain.component.css']
})
export class ChatmainComponent implements OnInit, OnDestroy {
  @ViewChild(ChatComponent) chatComponent:ChatComponent;
  public imageData:String = '';
  private pairRobotSub:Subscription;
  private isOrphanedSub:Subscription;
  private isOpenSub:Subscription;
  private isRobotLoginSub:Subscription;
  isRobotLoggedIn = false;

  constructor(private robotService: RobotService,
    private userService:UserService,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.pairRobotSub = this.robotService.PairRobotResult$.subscribe(result => {
      if(result==''){
        this.pairWithRobot();
      } else {
        this.spinner.hide();
      }
    });
    this.isOrphanedSub = this.robotService.IsOrphanedResult$.subscribe(result => {
      this.spinner.show();
      this.pairWithRobot();
    });
    this.isOpenSub = this.robotService.IsOpenResult$.subscribe(result=>{
      this.pairWithRobot();
    });
    this.isRobotLoginSub = this.robotService.RobotLoginStatusResult$.subscribe(result=>{
      var newStatus = result.toLowerCase()=='true'?true:false;
      if(newStatus!=this.isRobotLoggedIn){
        this.isRobotLoggedIn = newStatus;
        delay(1000).then(()=>{
          this.chatComponent.getContactList();
        });
      }
    });

    this.robotService.connectWs(localStorage.getItem('phoneno'));
    this.spinner.show();
  }

  ngOnDestroy() {
    this.pairRobotSub.unsubscribe();
    this.isOrphanedSub.unsubscribe();
    this.isOpenSub.unsubscribe();
    this.isRobotLoginSub.unsubscribe();
  }

  public pairWithRobot(){
    this.robotService.sendMessage(JSON.stringify(<SendMessage>{
      Sender : localStorage.getItem('phoneno'),
      MessageType : 'PairRobotUIMessage',
      Message : '{}'
    }));
  }

  public unpairWithRobot(){
    var mess = <any>{
      UIId : localStorage.getItem('phoneno'),
      RobotId : localStorage.getItem('robotConnId')
    };
    console.log(JSON.stringify(<SendMessage>{
      Sender : localStorage.getItem('phoneno'),
      MessageType : 'UnPairRobotUIMessage',
      Message : mess
    }));
    this.robotService.sendMessage(JSON.stringify(<SendMessage>{
      Sender : localStorage.getItem('phoneno'),
      MessageType : 'UnPairRobotUIMessage',
      Message : JSON.stringify(mess)
    }));
  }
}

export class SendMessage{
  constructor(
    public Sender:string,
    public MessageType:string,
    public Message:string
  ) {}
}
