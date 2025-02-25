import { rhvTier0TestArray } from './config_tier0';
import { login } from '../../../utils/utils';
import { providerRhv } from '../../models/providerRhv';
import { MappingNetwork } from '../../models/mappingNetwork';
import { MappingStorage } from '../../models/mappingStorage';
import { Plan } from '../../models/plan';

describe(
  'Tier0 tests, creating RHV provider, network and storage(both ceph and nfs) mappings, ' +
    'plan (both cold and warm), running plan and deleting at the end',
  () => {
    const provider = new providerRhv();
    const networkMapping = new MappingNetwork();
    const storageMapping = new MappingStorage();
    const plan = new Plan();

    rhvTier0TestArray.forEach((currentTest) => {
      beforeEach(() => {
        login(currentTest.loginData);
      });

      it('Login to MTV and create provider', () => {
        provider.create(currentTest.planData.providerData);
      });

      it('Create new network and storage mapping', () => {
        networkMapping.create(currentTest.planData.networkMappingData);
        storageMapping.create(currentTest.planData.storageMappingData);
      });

      it('Creating plan with existing network and storage mapping', () => {
        plan.create(currentTest.planData);
      });

      it('Running plan created in a previous tests', () => {
        plan.execute(currentTest.planData);
      });

      after('Deleting plan, mappings and provider created in a previous tests', () => {
        login(currentTest.loginData);
        plan.delete(currentTest.planData);
        networkMapping.delete(currentTest.planData.networkMappingData);
        storageMapping.delete(currentTest.planData.storageMappingData);
        provider.delete(currentTest.planData.providerData);
        const namespace = currentTest.planData.namespace;
        const vm_list = currentTest.planData.vmList;
        vm_list.forEach((vm) => {
          cy.exec(`oc delete vm ${vm} -n${namespace}`);
        });
      });
    });
  }
);
