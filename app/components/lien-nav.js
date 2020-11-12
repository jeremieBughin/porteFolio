import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class LienNavComponent extends Component {
    @tracked onButton = this.args.state ;
    @service router;
    

    @action
    handleInteraction() {
      console.log(this.args.hoverOff)
      if(this.args.value =="home"){
        this.router.transitionTo(''); 
      }
      else {
        this.router.transitionTo(`/${this.args.value}/`);
      }
      
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
