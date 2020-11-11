import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class NavBarComponent extends Component {

    @action
  showPerson(person) {
    alert(`The person's name is ${person}!`);
  }
  @action 
  hoverButton(){
      console.log(this.args);
  }
}
