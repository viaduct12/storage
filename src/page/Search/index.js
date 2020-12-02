import React from "react";
import './style.css';
import Button from '../../components/Button'
import Table from '../../components/Table'
import API from '../../utils/API';

class SignUp extends React.Component {

    state = {
        firstName: "",
        lastName: "",
        data: "",
        headers: ['fullName', 'firstName', 'lastName'],
        tableData: [],
        notFound: 'false',
        text: '',
        dataLoaded: 'false'
    };

    handleChange = (event) => {
        const { name, value } = event.target;
        // console.log(name, value)
        this.setState({ [name]: value });
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        this.setState({
            'notFound': 'false',
            'lastName': '',
            'firstName': ''
        });
        // alert('here is value ' + this.state.value);
        // console.log(this.state, "my state");
        // event.target[0].value = "";
        // event.target[1].value = "";

        if (this.state.dataLoaded === 'true') {

            if (this.state.firstName === '' && this.state.lastName === '') {
                this.setState({ 
                    'notFound': 'true', 
                    'text': 'Please enter first name, last name, or both!' 
                });
            } else {

                let apiData = await API.getData(this.state.firstName, this.state.lastName);
                
                if (apiData.length !== 0) {
                    // console.log('hello');
                    this.setState({
                        'headers': ['fullName', 'firstName', 'lastName']
                    })
                    apiData.map(allData => {
                        // console.log();
                        let objectKeyArr = Object.keys(allData);
                        objectKeyArr.map(keys => {

                            let boolArr = this.state.headers.includes(keys);
    
                            if (!boolArr) {
                                // console.log(keys);
                                this.state.headers.push(keys);
                            }
                        })
                    })
                }
                // console.log(apiData.length, 'response from api');
                // this.setState({ 'tableData': apiAllData })

                apiData.length === 0 ? this.setState({ 
                    'notFound': 'true', 
                    'text': 'Could not be found, Try again!' 
                }) : this.setState({ 
                    'notFound': 'false',
                    'tableData': apiData
                });
                // apiData = JSON.stringify(apiData.Items);
                // console.log(`apiData: ${apiData.length}`);
            }
        } else {
            this.setState({
                'text': 'Load data first!'
            })
        }
    }

    handleClick = async (event) => {
        this.setState({ 'notFound': 'false' });
        // console.log("click happened", event.target.value);
        // console.log('testing s3 capabilities');
        // if (event.target.value === 'Load') API.dlFile();
        const { value } = event.target;
        value === 'Load' ? API.loadData().then(res => {
            this.preparePayload(res.data.split('\r\n'))
            this.setState({
                'data': res.data.split("\r\n"),
                'dataLoaded': 'true',
                'firstName': '',
                'lastName': ''
            })
        }) : API.clearData();
        let apiAllData = await API.getAllData();
        // console.log('all data', apiAllData);
        apiAllData.map(allData => {
            // console.log();
            let objectKeyArr = Object.keys(allData);
            objectKeyArr.map(keys => {
                let boolArr = this.state.headers.includes(keys);

                if (!boolArr) {
                    // console.log(keys);
                    this.state.headers.push(keys);
                }
            })
        })
        this.setState({ 'tableData': apiAllData })


        if (value === 'Clear')
            this.setState({
                'tableData': [],
                'dataLoaded': 'false'
            })
    }

    preparePayload = datas => {
        // console.log(datas);
        let update = datas.map(data => {
            let payload = {
                fullName: "",
                firstName: "",
                lastName: ""
            }

            if (data !== "") {
                data = data.replace(/\t/g, ' ').trim();
                let newArr = data.split(' ');
                
                let firstName = newArr.shift();
                let lastName = newArr[0] !== "" ? newArr.shift() : newArr.shift()
                lastName = lastName === '' ? newArr.shift() : lastName
                // console.log(newArr, 'shifted')
                payload.fullName = `${firstName} ${lastName}`
                payload.firstName = firstName
                payload.lastName = lastName

                for (let i = 0; i < newArr.length; i++) {
                    if (newArr[i] !== "") {
                        let tempArr = newArr[i].split('=');
                        // console.log(tempArr[0], tempArr[1])
                        payload[tempArr[0]] = tempArr[1];
                        // console.log(this.state.headers.includes(tempArr[0]))
                        let boolArr = this.state.headers.includes(tempArr[0]);

                        if (!boolArr) {
                            this.state.headers.push(tempArr[0]);
                        }
                    }
                }
                API.putData(payload);
                // console.log(payload, 'the payload')
                return payload;
            }
            return payload;
        })
        update = update[update.length - 1] === undefined ? update.pop : update;
        // console.log(update[update.length -1], 'last index');
        // update.pop();
        // this.setState({ 'tableData': update })
    }
    render() {
        return (
            <>
                <div className='container'>
                    <div className='row'>
                        <div id="loginBackground">
                            <div className="col m4 push-m4 front" id="containerLogin">
                                {
                                    this.state.notFound === 'true' || this.state.dataLoaded === 'false' ? <p>{this.state.text}</p> : <h1>Search!</h1>
                                }
                                <form onSubmit={this.handleSubmit}>
                                    <input id="input" type="text" name="firstName" value={this.state.firstName} onChange={this.handleChange} placeholder="first name" /><br />
                                    <input id="input" type="text" name="lastName" value={this.state.lastName} onChange={this.handleChange} placeholder="last name" /><br />
                                    <button className="astext" type="submit">Query</button>
                                </form>
                                <Button className='query' name="Load" onClick={this.handleClick} />
                                <Button className='query' name="Clear" onClick={this.handleClick} />
                            </div>
                        </div>
                    </div>

                    <div className='row astext'>
                        {
                            this.state.tableData.length === 0 ? <div className='load'>Load data first...</div> : <div className='tableContainer'><Table  headers={this.state.headers} tabData={this.state.tableData} /></div>
                        }
                    </div>
                </div>
            </>
        );
    }
}

export default SignUp;