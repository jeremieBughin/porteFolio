import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
export default class LienNavComponent extends Component {
    @tracked onButton = this.args.state ;
    //@tracked hoverOff = this.args.hoverOff ; 

    @action
    handleInteraction() {
      console.log(this.args.hoverOff)
    }
    @action handlerHoverOn(){
      if(this.args.hoverOff == false){
        this.onButton = false ; 
        console.log(this.onButton) 
      }
           
    }
    @action handlerHoverOff(){
      if(this.args.hoverOff == false){
        this.onButton = true ; 
        console.log(this.onButton)
      }  
    }
}
