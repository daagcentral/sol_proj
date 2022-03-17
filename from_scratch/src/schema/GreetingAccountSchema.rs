mod GreetingAccountSchema {
    use borsh::{BorshDeserialize, BorshSerialize};
    /// Define the type of state stored in accounts
    #[derive(BorshSerialize, BorshDeserialize, Debug)]
    pub struct GreetingAccount {
        /// number of greetings
        pub counter: u32,
    }

    pub fn get_greetings_account(account_info: &Ref<&mut [u8]>) -> GreetingAccount {
        GreetingAccount::try_from_slice(&account.data.borrow())?
    }
}
