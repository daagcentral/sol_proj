use std::string;

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub mod instruction;
use crate::instruction::HelloInstruction;

/// Define the type of state stored in accounts
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub age: u32,
}

// Declare and export the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the hello world program was loaded into
    accounts: &[AccountInfo], // The account to say hello to
    instruction_data: &[u8], // Ignored, all helloworld instructions are hellos
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");
    let instuction = HelloInstruction::unpack(instruction_data)?;
    // Iterating accounts is safer than indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let account = next_account_info(accounts_iter)?;

    // The account must be owned by the program in order to modify its data
    if account.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    match instuction {
        HelloInstruction::Increment => greeting_account.age += 1,
        HelloInstruction::Decrement => greeting_account.age -= 1,
        HelloInstruction::SetAge(val) => greeting_account.age = val,
    }
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?;

    msg!("Age: {}", greeting_account.age);

    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    // fn test_sanity() {
    //     let program_id = Pubkey::default();
    //     let key = Pubkey::default();
    //     let mut lamports = 0;
    //     let mut data = vec![0; mem::size_of::<u32>()];
    //     let owner = Pubkey::default();
    //     let account = AccountInfo::new(
    //         &key,
    //         false,
    //         true,
    //         &mut lamports,
    //         &mut data,
    //         &owner,
    //         false,
    //         Epoch::default(),
    //     );

    //     let arr = u32::to_le_bytes(100);
    //     let mut instruction_data = [2; 5];
    //     for i in 0..4 {
    //         instruction_data[i + 1] = arr[i];
    //     }

    //     let accounts = vec![account];

    //     assert_eq!(
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .age,
    //         0
    //     );
    //     process_instruction(&program_id, &accounts, &instruction_data).unwrap();
    //     assert_eq!(
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .age,
    //         100
    //     );
    //     instruction_data[0] = 0;
    //     process_instruction(&program_id, &accounts, &instruction_data).unwrap();
    //     assert_eq!(
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .age,
    //         101
    //     );
    //     instruction_data[0] = 1;
    //     process_instruction(&program_id, &accounts, &instruction_data).unwrap();
    //     assert_eq!(
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .age,
    //         100
    //     );

    //     let arr = *b"hellocac";
    //     let mut instruction_data = [3; 9];
    //     for i in 0..8 {
    //         instruction_data[i + 1] = arr[i];
    //     }
    //     process_instruction(&program_id, &accounts, &instruction_data).unwrap();
    //     print!(
    //         "{:?}",
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .name
    //     );
    //     assert_eq!(
    //         GreetingAccount::try_from_slice(&accounts[0].data.borrow())
    //             .unwrap()
    //             .name,
    //         *b"hellocac"
    //     );
    // }

    #[test]
    #[should_panic]
    fn test_panic() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );

        let arr = u32::to_le_bytes(100);
        let mut instruction_data = [1; 5];
        for i in 0..4 {
            instruction_data[i + 1] = arr[i];
        }

        let accounts = vec![account];

        assert_eq!(
            GreetingAccount::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .age,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
    }
}
