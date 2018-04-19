
import * as React from 'react'
import moment from 'moment'
import Paper from 'material-ui/Paper'

import IncrementComponent from '../commonComponents/incrementComponent'
import OptionsSelectorComponent from '../commonComponents/OptionsSelectorComponent'
import DatePickerComponent from '../commonComponents/DatePickerComponent'
import AlertComponent from '../commonComponents/alertComponent/AlertComponent'
import ModalComponent from '../commonComponents/modalComponent/ModalComponent'
import { createMeal, getLibraries } from '../../api/api'

require('./MealTallyComponent.scss');

class MealTallyComponent extends React.Component {
    INITIAL_MEAL_TALLY_DETAILS = {
        _id: '',
        library: 'Almaden Branch Library',
        date: moment(),
        type: 'Lunch',
        received: 0,
        leftovers: 0,
        childrenAndTeens: 0,
        teenStaffAndVolunteers: 0,
        adult: 0,
        unusable: 0,
        createdBy: {},
        signature:''
    }
    
    constructor(props) {
        super(props)
        this.props = props
        console.log('oooo what passed?')
        this.state = {
            showDate: false,
            libraries: [],
            mealTypes: ['Breakfast', 'AM Sanck', 'Lunch', 'PM Snack', 'Dinner'],
            mealTallyDetails: this.INITIAL_MEAL_TALLY_DETAILS
        }
    }

    componentWillMount(props) {
        getLibraries().then(libraries => {
            this.setState({
                ...this.state,
                libraries: libraries
            })
        }).catch(error => {
            console.log('error getting libraries: ', error)
            this.setState({
                ...this.state,
                libraries: []
            })
        })
    }

    toggleShowDate = (event) => {
        this.setState({
            ...this.state,
            showDate: !this.state.showDate
        })
    }

    handleMealTallyDetailsIncrementField = (event, fieldName, value) => {
        event.preventDefault()
        let incValue = this.state.mealTallyDetails[fieldName] + value
        incValue = incValue > 0 ? incValue: 0
        this.setState({
            ...this.state,
            mealTallyDetails: {
                ...this.state.mealTallyDetails,
                [fieldName]: incValue
            }
        })
    }
    handleMealTallyDetailsOptionsField = (event, fieldName) => {
        event.preventDefault()
        console.log('options fieldName: ', fieldName)
        console.log('options value: ', event.target.value)
        this.setState({
            ...this.state,
            mealTallyDetails: {
                ...this.state.mealTallyDetails,
                [fieldName]: event.target.value
            }
        })
    }
    handleDateField = (date) => {
        this.setState({
            ...this.state,
            showDate: !this.state.showDate,
            mealTallyDetails: {
                ...this.state.mealTallyDetails,
                date: date
            }
        })
    }
    alertHandler = (event) => {
        event.preventDefault()
        this.setState({
            ...this.state,
            showAlert: false
        })
    }
    handleSaveMealTally = (event) => {
        event.preventDefault()
        
        this.setState({
            ...this.state,
            loadingMessage: 'Saving please wait...',
            showModal: true,
            modalMessage: 'Please review report before saving.'
        })
        //this.handleCreateMeal({})
    }

    handleSignature = (event) => {
        event.preventDefault()
        this.setState({
            ...this.state,
            mealTallyDetails: {
                ...this.state.mealTallyDetails,
                signature: event.target.value
            }
        })
    }

    handleModalEdit = (event) => {
        event.preventDefault()
        this.setState({
            ...this.state,
            showModal: false,
            showLoading: false
        })
    }

    handleCreateMeal = (event) => {
        // if event is empty object then don't call preventDefault when needing to call programatically without event
        Object.keys(event).length > 0 ? event.preventDefault(): ''

        const data = this.state.mealTallyDetails
        data['createdBy'] = (this.props.user && this.props.user._id) || 'guest'
        createMeal(data).then(response => {
            this.setState({
                ...this.state,
                mealTallyDetails: this.INITIAL_MEAL_TALLY_DETAILS,
                showLoading: false,
                showAlert: true,
                showModal: false,
                alertMessage: 'Successfully saved!'
            })
        }).catch(error => {
            console.log('create meal error: ', error)
            this.setState({
                ...this.state,
                showLoading: false,
                showAlert: true,
                alertMessage: 'Error saving please try again later!'
            })
        })
    }

    render() {
        const totalMealAvailable = this.state.mealTallyDetails.received + this.state.mealTallyDetails.leftovers
        const totalMealServed = this.state.mealTallyDetails.childrenAndTeens + this.state.mealTallyDetails.teenStaffAndVolunteers + this.state.mealTallyDetails.adult
        const totalLeftover = totalMealAvailable - totalMealServed - this.state.mealTallyDetails.unusable
        const libraryOptions = this.state.libraries.map(library => {
            return library.name
        })
        return (
            <div className="mealTallyContainer">
                {this.state.showModal ? <ModalComponent message={this.state.modalMessage} handleEdit={this.handleModalEdit} handleSave={this.handleCreateMeal} report={this.state.mealTallyDetails} />: ''}
                {this.state.showLoading ? <AlertComponent isLoading={true} message={this.state.loadingMessage} />: ''}
                {this.state.showAlert ? <AlertComponent isLoading={false} handleAlert={this.alertHandler} message={this.state.alertMessage} />: ''}
                <Paper>
                    <div className="introContainer">
                        <div className="infoContainer">
                            <div>
                                <h3 className="infoContainerTitle">Meal Plan</h3>
                            </div>
                            <div className="dateContainer">
                                <span className="dateDisplay" onClick={this.toggleShowDate} >Date: {moment(this.state.mealTallyDetails.date).format('MMM DD YYYY')}</span>
                                {this.state.showDate ? <DatePickerComponent
                                    name={'Date'}
                                    dateSelected={this.state.mealTallyDetails.date}
                                    handleDateSelected={this.handleDateField}
                                />
                                : ''}
                            </div>
                        </div>
                        <div className="libraryType">
                            <div className="infoContainer">
                                <OptionsSelectorComponent
                                    optionsName={'Library'}
                                    fieldName={'library'}
                                    options={libraryOptions}
                                    itemSelected={this.state.mealTallyDetails.library}
                                    optionsHandler={this.handleMealTallyDetailsOptionsField}
                                />
                                <OptionsSelectorComponent
                                    optionsName={'Type'}
                                    fieldName={'type'}
                                    options={this.state.mealTypes}
                                    itemSelected={this.state.mealTallyDetails.type}
                                    optionsHandler={this.handleMealTallyDetailsOptionsField}
                                />
                                
                            </div>
                    </div>
                        <div className="infoContainer availableContainer">
                            <h3 className="infoContainerTitle">Available Meals</h3>
                            <IncrementComponent 
                                incrementerName={"Meals from Vendor"}
                                fieldName={'received'}
                                itemCount={this.state.mealTallyDetails.received} 
                                incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                            />
                            <IncrementComponent 
                                incrementerName={"Leftover from Yesterday"}
                                fieldName={'leftovers'}
                                itemCount={this.state.mealTallyDetails.leftovers} 
                                incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                            />
                            <div className="totalMeals">
                                <span className="tallyTotal">Total Meals Available:</span>
                                <div className="totalNumber">
                                    {totalMealAvailable}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="infoContainer">
                        <h3 className="infoContainerTitle">Served Meals</h3>
                        
                        <IncrementComponent 
                            incrementerName={"Children & Teens"}
                            fieldName={'childrenAndTeens'}
                            itemCount={this.state.mealTallyDetails.childrenAndTeens} 
                            incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                        />
                    </div>
                    <div className="infoContainer">
                        <IncrementComponent 
                            incrementerName={"Teen Staff & Volunteers"} 
                            fieldName={'teenStaffAndVolunteers'}
                            itemCount={this.state.mealTallyDetails.teenStaffAndVolunteers} 
                            incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                        />
                        <IncrementComponent 
                            incrementerName={"Adults"} 
                            fieldName={'adult'}
                            itemCount={this.state.mealTallyDetails.adult} 
                            incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                        />
                    </div>
                    <div className="infoContainer">
                        <IncrementComponent 
                            incrementerName={"Unusable Meals"}
                            fieldName={'unusable'}
                            itemCount={this.state.mealTallyDetails.unusable} 
                            incrementerHandler={this.handleMealTallyDetailsIncrementField} 
                        />
                        <div className="totalServed">
                            <span className="tallyTotal">Total Meals Served:</span>
                            <div className="totalNumber">
                                {totalMealServed}
                            </div>
                        </div>
                    </div>
                    <div className="totalLeftover">
                            <span className="tallyTotal">Leftover Meals:</span>
                            <div className="totalNumber">
                                {totalLeftover}
                            </div>
                        </div>
                    <div className="signatureBox">
                        <label>Signature: </label><input type="text" onChange={this.handleSignature} />
                    </div>

                    <button className="saveMealTally" onClick={this.handleSaveMealTally}>Save</button>
                </Paper>
            </div>
        )
    }
}

export default MealTallyComponent
