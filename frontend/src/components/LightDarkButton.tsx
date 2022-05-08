import React from 'react';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { Sun, MoonStars } from 'tabler-icons-react';

function LightDarkButton() {
    
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
     const dark = colorScheme === 'dark';
  
    return (
        <div>   
            <ActionIcon
            variant="outline"
            color={dark ? 'yellow' : 'blue'}
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
            >
            {dark ? <Sun size={18} /> : <MoonStars size={18} />}
            </ActionIcon>
        </div>
    )
}

export default LightDarkButton