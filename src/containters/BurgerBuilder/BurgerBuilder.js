import React, { Component } from 'react';
import { connect } from 'react-redux';

import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import WithErrorHandler from '../../hoc/WithErrorHandler/WithErrorHandler';
import axios from '../../axios-orders';
import * as burgerBuilderActions from '../../store/actions/index';

class BurgerBuilder extends Component{
  state = {
    purchasable: false,
    purchasing: false,
    loading: false,
    error: false
  }

  componentDidMount () {
    // axios.get('https://my-burger-react-c54da.firebaseio.com/ingredients.json')
    //   .then(response => {
    //     this.setState({ingredients: response.data});
    //   })
    //   .catch(error => {
    //     this.setState({error: true});
    //   });
  }

  purchaseHandler = () => {
    this.setState({purchasing: true});
  }

  updatePurchaseState = (ingredients) => {
    const sum = Object.keys(ingredients)
      .map( (igKey) => {
        return ingredients[igKey];
      } )
      .reduce((sum, el) => {
        return sum + el;
      }, 0);
      return sum > 0;
  }

  purchaseCancelHandler = () => {
    this.setState({purchasing: false})
  }

  purchasContinueHandler = () => {
    this.props.history.push('/checkout');
  }

  render () {
    const disabledInfo = {
      ...this.props.ings
    };
    for(let key in disabledInfo){
      disabledInfo[key] = disabledInfo[key] <= 0;
    }
    let orderSummary = null;
    let burger = this.state.error ? <p>Ingredient can't be loaded</p> : <Spinner />
    if (this.props.ings){
      burger = (
        <>
          <Burger ingredients={this.props.ings}/>
          <BuildControls 
            ingredientAdded={this.props.onIngredientAdded}
            ingredientRemoved={this.props.onIngredientRemoved}
            disabled={disabledInfo}
            price={this.props.price}
            purchasable={this.updatePurchaseState(this.props.ings)}
            purchase={this.purchaseHandler}
            />
        </>
      );

      orderSummary = (
        <OrderSummary
          ingredients={this.props.ings}
          purchaseContinue={this.purchasContinueHandler}
          purchaseCancelled={this.purchaseCancelHandler}
          totalPrice={this.props.price} />
      );
    }
    
    if(this.state.loading) {
      orderSummary = <Spinner />;
    }
    return (
      <>
        {burger}
        <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
          {orderSummary}
        </Modal>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    ings: state.ingredients,
    price: state.totalPrice
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onIngredientAdded: (ingName) => dispatch(burgerBuilderActions.addIngredient(ingName)),
    onIngredientRemoved: (ingName) => dispatch(burgerBuilderActions.removeIngredient(ingName))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WithErrorHandler( BurgerBuilder, axios ));