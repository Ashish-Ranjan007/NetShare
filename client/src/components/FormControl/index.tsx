import Input from './Input';

const FormControl = (props: any) => {
	const { control, ...rest } = props;

	switch (control) {
		case 'input':
			return <Input {...rest} />;
		default:
			return <Input {...rest} />;
	}
};

export default FormControl;
