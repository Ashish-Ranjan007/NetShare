import { useState } from 'react';
import SwipeableView from 'react-swipeable-views';
import { Box, Button, MobileStepper, useTheme } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

type ContentType = {
	public_id: string;
	secure_url: string;
};

const Carousel = ({ contents }: { contents: ContentType[] }) => {
	const theme = useTheme();
	const [activeStep, setActiveStep] = useState<number>(0);

	const handleNext = () => {
		setActiveStep((prev) => prev + 1);
	};

	const handleBack = () => {
		setActiveStep((prev) => prev - 1);
	};

	const handleStepChange = (step: number) => {
		setActiveStep(step);
	};

	return (
		<Box sx={{ maxWidth: '500px', flexGrow: 1 }}>
			<SwipeableView
				axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
				index={activeStep}
				onChangeIndex={handleStepChange}
				enableMouseEvents
			>
				{contents.map((step, index) => (
					<div key={index}>
						{Math.abs(activeStep - index) <= 2 ? (
							<Box
								sx={{
									height: 255,
									display: 'block',
									maxWidth: '500px',
									overflow: 'hidden',
									width: '100%',
									backgroundSize: 'contain',
									backgroundPosition: 'center',
									backgroundRepeat: 'no-repeat',
									backgroundImage: `url(${step.secure_url})`,
									backgroundColor: '#fff',
								}}
							/>
						) : null}
					</div>
				))}
			</SwipeableView>
			<MobileStepper
				steps={contents.length}
				position="static"
				activeStep={activeStep}
				nextButton={
					<Button
						size="small"
						onClick={handleNext}
						disabled={activeStep === contents.length - 1}
					>
						Next
						{theme.direction === 'rtl' ? (
							<KeyboardArrowLeft />
						) : (
							<KeyboardArrowRight />
						)}
					</Button>
				}
				backButton={
					<Button
						size="small"
						onClick={handleBack}
						disabled={activeStep === 0}
					>
						{theme.direction === 'rtl' ? (
							<KeyboardArrowRight />
						) : (
							<KeyboardArrowLeft />
						)}
						Back
					</Button>
				}
			/>
		</Box>
	);
};

export default Carousel;
