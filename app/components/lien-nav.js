import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class LienNavComponent extends Component {
    @action handleInteraction(e) { 
        e.preventDefault();
        this.args.action();
      } 
    }
