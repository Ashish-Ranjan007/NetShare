import Date from './Date';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';
import TextInput from './TextInput';

const FormControl = (props: any) => {
	const { control, ...rest } = props;

	switch (control) {
		case 'input':
			return <Input {...rest} />;
		case 'textInput':
			return <TextInput {...rest} />;
		case 'textarea':
			return <Textarea {...rest} />;
		case 'select':
			return <Select {...rest} />;
		case 'date':
			return <Date {...rest} />;
		default:
			return <Input {...rest} />;
	}
};

export default FormControl;
