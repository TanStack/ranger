import { ReactiveController, ReactiveControllerHost } from 'lit'
import { Ranger, RangerConfig, RangerOptions } from '@tanstack/ranger'

export * from '@tanstack/ranger'

export class RangerController<TTrackElement> implements ReactiveController {
  host: ReactiveControllerHost

  private ranger: Ranger<TTrackElement> | null = null

  constructor(host: ReactiveControllerHost) {
    ;(this.host = host).addController(this)
  }

  private async rerender() {
    await this.host.updateComplete
    this.host.requestUpdate()
  }

  getRanger(options: RangerOptions<TTrackElement>) {
    const resolvedOptions: RangerConfig<TTrackElement> = {
      ...options,
      rerender: async () => {
        await this.rerender()
      },
      onChange: async (instance) => {
        await this.rerender()
        options.onChange?.(instance)
      },
    }

    if (!this.ranger) {
      this.ranger = new Ranger<TTrackElement>(resolvedOptions)
    }
    this.ranger.setOptions(resolvedOptions)
    return this.ranger
  }

  async hostUpdated() {
    this.ranger?._willUpdate()
  }
}
