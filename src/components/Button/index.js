import React from 'react';
import './style.css';

const Button = (props) => {

	return (
		<button
			className='query'
			onClick={ props.onClick }
			value={ props.name }
		>
			{ props.name }

		</button>)
}

export default Button;