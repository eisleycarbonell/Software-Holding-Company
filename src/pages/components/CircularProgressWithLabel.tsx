import * as React from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function CircularWithValueLabel({value, isPaused}:any) {
  const router = useRouter();
  const [progress, setProgress] = React.useState(value);

  React.useEffect(() => {
    if(!isPaused) {
      const timer = setInterval(() => {
        setProgress((prevProgress:any) => (prevProgress >= 100 ? 0 : prevProgress + 10));
      }, 500);
      return () => {
          clearInterval(timer);
      };
    }
  }, [isPaused]);

  if(progress == 100){
    router.reload();
  }

  return <CircularProgressWithLabel value={progress}/>;
}