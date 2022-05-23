import {Trans} from 'react-i18next';
import Modal from '../../Modal';
import {contentStyle, H3} from './styled';

type OfferDescriptionModalProps = {
  open: boolean;
  onClose: () => void;
  supplierId?: string;
};

function OfferDescriptionModal({open, onClose}: OfferDescriptionModalProps) {
  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      withCloseButton
      open={open}
      onClose={onClose}
      contentStyle={contentStyle}
    >
      <Trans i18nKey="waivo_damage_protection_description_modal">
        <h2>Waivo™ Damage Protection Program</h2>
        <p>
          The program offers the industry’s broadest protection, and requires no
          communication with the guest. It’s damage done right.
        </p>
        <p>
          Waivo provides protection against both accidental and intentional damage caused
          by a guest during their stay. The guest is charged a nonrefundable damage
          protection fee in lieu of, or in addition to, the traditional security deposit.
          The entire stay is covered up to the limit you choose.
        </p>
        <H3>Why Damage Protection?</H3>
        <ul>
          <li>Save valuable time with our quick and easy program features.</li>
          <li>No guest communication required improves guest experiences & reviews.</li>
          <li>Peace of mind protection the property manager, homeowner, and guest.</li>
        </ul>
        <H3>How does it work?</H3>
        <ul>
          <li>Protection limit options are $1,500, $2,500, and $5,000.</li>
          <li>
            There is a static net fee per reservation, and you have the flexibility to
            determine the fee markup to the guest.
          </li>
          <li>
            During the online check-in, the guest is notified of the damage protection
            program and fee.
          </li>
        </ul>
        <H3>What if damage occurs?</H3>
        <ul>
          <li>
            If guest damage is found, a Damage Notice is submitted to Waivo within 14-days
            of the guest departing the property.
          </li>
          <li>
            Submit photos of the damage, description, and estimated cost of
            repair/replacement.
          </li>
          <li>
            Most Damage Notices are reviewed, approved, and reimbursed within 1-3 days.
          </li>
        </ul>
      </Trans>
    </Modal>
  );
}

export {OfferDescriptionModal};
