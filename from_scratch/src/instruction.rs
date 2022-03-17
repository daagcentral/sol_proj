use solana_program::{
    program_error::ProgramError,
};
use std::{convert::TryInto};

#[derive(Debug)]
pub enum HelloInstruction {
    Increment,
    Decrement,
    SetAge(u32),
}

impl HelloInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&tag, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        match tag {
            0 => return Ok(HelloInstruction::Increment),
            1 => return Ok(HelloInstruction::Decrement),
            2 => {
                if rest.len() != 4 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let val: Result<[u8; 4], _> = rest[..4].try_into();
                match val {
                    Ok(i) => return Ok(HelloInstruction::SetAge(u32::from_le_bytes(i))),
                    _ => return Err(ProgramError::InvalidInstructionData)
                }
            }
            // 3 => {
            //     if rest.len() != 8 {
            //         print!("\n\nHERE size: {}", rest.len());
            //         return Err(ProgramError::InvalidInstructionData);
            //     }
            //     let val: Result<[u8; 8], _> = rest[..8].try_into();
            //     match val {
            //         Ok(i) =>return Ok(HelloInstruction::SetName(i)),
            //         _ => return Err(ProgramError::InvalidInstructionData)
            //     }
            // }
  
            _ => return Err(ProgramError::InvalidInstructionData)
        }
    }
}
