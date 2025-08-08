export class UpdateChatReadPresenter {
  message!: string

  constructor(success: boolean) {
    this.message = success
      ? 'Update service successfully'
      : 'Update service failed'
  }
}
