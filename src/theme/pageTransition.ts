import { createAnimation } from '@ionic/react';

export const fadeRise = (_baseEl: HTMLElement, opts: any) => {
  const entering = createAnimation()
    .addElement(opts.enteringEl)
    .beforeRemoveClass('ion-page-invisible')
    .duration(220)
    .easing('ease-out')
    .fromTo('opacity', '0', '1')
    .fromTo('transform', 'translateY(12px)', 'translateY(0)');

  const root = createAnimation().addAnimation(entering);

  if (opts.leavingEl) {
    root.addAnimation(
      createAnimation()
        .addElement(opts.leavingEl)
        .duration(160)
        .easing('ease-in')
        .fromTo('opacity', '1', '0')
    );
  }
  return root;
};